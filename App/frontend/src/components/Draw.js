import React, { useRef, useState } from 'react';
import { SketchField, Tools } from 'react-sketch';
import { Button, Alert } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { findDOMNode } from 'react-dom';

const styles = {
    draw: {
        margin: '0 auto',
        paddingTop: '20px',
        borderRadius: '20px',
    }
}

const Draw = () => {

    const [send, setSend] = useState(false)

    const [result, setResult] = useState()

    const sketch = useRef()

    const hundleSubmit = () => {
        const canvas = sketch.current.toDataURL()
        // console.log(canvas)
        // saveAs(canvas, 'Test.jpg')
        sendData(canvas)
    }

    const hundleReset = () => {
        sketch.current.clear()
        sketch.current._backgroundColor('white')
        setSend(false)
        setResult(false)
    }

    const sendData = (data) => {
        // console.log(data)

        const headers = {
            'accept': 'application/json'
        }

        var fd = new FormData()
        fd.append('image', data)

        // for (var key of fd.entries()) {
        //     console.log(key[0] + ', ' + key[1]);
        // }

        axios.post('http://localhost:8000/api/digits/', fd, { headers: headers })
            .then(res => {
                console.log(res.data)
                setSend(true)
                getImageResult(res.data.id)
            })
            .catch(err => {
                console.log(err)
            })

    }

    const getImageResult = (id) => {
        console.log(id)
        axios.get(`http://localhost:8000/api/digits/${id}/`)
            .then(res => {
                console.log(res.data)
                setResult(res.data.result)
            })
            .catch(err => {
                console.log(err)
            })
    }

    return (
        <React.Fragment>
            <text>Handwritten digit recognition</text>
            <text>www.google.com</text>
            <div className="row">
                <SketchField
                    ref={sketch}
                    onChange={hundleSubmit}
                    width='400px'
                    height='400px'
                    tool={Tools.Pencil}
                    backgroundColor="white"
                    lineColor="black"
                    imageFormat='png'
                    lineWidth={20}
                    style={styles.draw}
                />
            </div>
            <div className="row">
                <div className="col-md-8">
                    <Button onClick={hundleReset} variant='danger'> Reset </Button>
                </div>
            </div>
            <div className="col-md-8">
                {result && <Alert variant="info"> Result is {result} </Alert>}
            </div>
            <text>Made in Ensias. By: Benhima & bender</text>
        </React.Fragment>
    );
}

export default Draw;