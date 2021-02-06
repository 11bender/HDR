# Handwritten digit recognition (HDR)
Backpropagation neural network with Pytorch 💥

This project's aim is to realize a system to recognize handwritten digits and convert them to machine language.

The system is developed using a backpropagation neural network trained by the MNIST dataset.

An effective feature extraction called LLF (Local Line Fitting) is used. The method, based on simple geometric operations, is very efficient and yields a relatively low-dimensional and distortion invariant representation.

An important feature of the approach is that no preprocessing of the input image is required. A black & white or gray-scale pixel representation is directly used without thinning, contour following, binarization, etc. Therefore, high recognition speed can be achieved.
