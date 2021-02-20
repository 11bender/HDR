from django.db import models
import torch
from torch import nn 
from torchvision import datasets, transforms
from torch.utils.data import random_split, DataLoader
from torch import optim
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt
from PIL import ImageOps
from PIL import Image
from PIL import ImageEnhance

# Download train_data
train_data = datasets.MNIST('data', train=True, download=True)

# Feature extraction function
def feature_extraction(figure): #figure is a np array, shape 28*28

    # Split figure into 16 cells
    cells = [] #16

    x = np.vsplit(figure, 4)
    for i in range(len(x)):
        cells.extend(np.hsplit(x[i],4))

    cells_np = np.array(cells)

    # Extract 3 features from each cell
    feature_ex = [] #3*16

    for i in range(16):
        f1 = np.count_nonzero(cells_np[i] > 30)/49 #feature 1
        indices_nonzero = np.nonzero(cells_np[i] > 30)
        (y,x) = indices_nonzero
        if x.shape==(0,):
            f2=0.
            f3=1.
        else:
            x = x.reshape(-1, 1)
            y = y.reshape(-1, 1)
            reg = LinearRegression().fit(x, y)
            f2 = (2*float(reg.coef_))/(1+float(reg.coef_)**2) #feature 2
            f3 = (1-float(reg.coef_)**2)/(1+float(reg.coef_)**2) #feature 3

        feature_ex.append(f1)
        feature_ex.append(f2)
        feature_ex.append(f3)

    feature_ex_np = np.array(feature_ex).astype('float32')
    feature_ex = torch.as_tensor(feature_ex_np) #Don't allocate new memory

    return feature_ex

# Create new train data
new_train_data = []

for i in range (len(train_data)):
    print(i)
    feature_np = np.array(train_data[i][0])
    figure = feature_np.reshape(28,28)
    feature_ex = feature_extraction(figure)
    new_element = (feature_ex, train_data[i][1])
    new_train_data.append(new_element)

# Define Train validation loaders
train, val = random_split(new_train_data, [50000, 10000])
train_loader = DataLoader(train, batch_size=32)
val_loader = DataLoader(val, batch_size=32)

# Define the model
class ResNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.l1 = nn.Linear(16*3, 50)
        self.l2 = nn.Linear(50, 50)
        self.do = nn.Dropout(0.1)
        self.l3 = nn.Linear(50, 10)
    
    def forward(self, x):
        h1 = nn.functional.relu(self.l1(x))
        h2 = nn.functional.relu(self.l2(h1))
        do = self.do(h2 + h1)
        output = self.l3(do)
        return output

model = ResNet()

# Define the optimzer
optim = optim.Adam(model.parameters(), lr=0.001)

# Define the loss
loss = nn.CrossEntropyLoss()

#training
nb_epochs = 12
for epoch in range(nb_epochs):

  # Training loop
  train_loss = 0
  model.train()
  for batch in train_loader:
    feature, label = batch

    #1 forward 
    output = model(feature)

    #2 compute 
    L = loss(output, label)

    #3 clean
    model.zero_grad()

    #4 backward
    L.backward()

    #5 Apply
    optim.step()

    train_loss += L.item() #a tensor
    train_loss /= len(train_loader)


  # Validation loop
  valid_loss = 0
  correct = 0
  total = 0
  model.eval()
  for batch in val_loader:
    feature, label = batch

    #1 forward
    with torch.no_grad(): 
      output = model(feature) 

    #2 compute 
    L = loss(output, label)

    valid_loss +=  L.item()
    correct += torch.sum(torch.argmax(output, dim=1) == label).item()

  valid_loss /= len(val_loader)
  correct /= len(val_loader.dataset)

  print(f"epoch: {epoch+1}, train loss: {train_loss:.4f}, validation loss: {valid_loss:.4f}, correct predictions: {correct*100:.2f}%")

def img_resize(image):
    bw_image = image.convert(mode='L') #L is 8-bit black-and-white image mode
    bw_image = ImageEnhance.Contrast(bw_image).enhance(1.5)

    # Inver sample, get bbox.
    inv_sample = ImageOps.invert(bw_image)
    bbox = inv_sample.getbbox()

    crop = inv_sample.crop(bbox)
    crop.thumbnail((20,20))

    #resize back
    new_size = 28
    delta_w = new_size - crop.size[0]
    delta_h = new_size - crop.size[1]
    padding = (delta_w//2, delta_h//2, delta_w-(delta_w//2), delta_h-(delta_h//2))
    return np.array(ImageOps.expand(crop, padding))

class Imgupload(models.Model):
    title = models.CharField(max_length=20)
    image = models.ImageField(upload_to="media/predresult/", default=None)

class ServerDigit(models.Model):
    image = models.ImageField(upload_to = 'images')
    result = models.CharField(max_length = 2, blank = True)
    updated = models.DateTimeField(auto_now = True)
    created = models.DateTimeField(auto_now_add = True)
    
    def __str__(self):
        return str(self.id)

    def save(self, *args, **kwargs):
        # print(self.image)
        img = Image.open(self.image)
        img = img_resize(img)
        figure = feature_extraction(img)  
        pred_res = torch.argmax(model(figure))
        self.result = str(pred_res)

        return super().save(*args, **kwargs)