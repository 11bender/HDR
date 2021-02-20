import React, { useRef, useState } from 'react';
import { SketchField, Tools } from 'react-sketch';
import { Button, Alert } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { findDOMNode } from 'react-dom';
import "./style.css";

const styles = {
    draw: {
        margin: '0 auto',
        borderRadius: '20px',
    },
    center: {
        // margin: 0,
        // position: 'absolute',
        // top: '65%',
        // left: '50%',
        margin: '0 auto',
        width: '200px',
        borderRadius: '15px',
        border: 'none',
        // -ms-transform: 'translate(-50%, -50%)',
        // transform: 'translate(-50%, -50%)',
        backgroundColor: 'red',
        opacity: '0.6',
    },
}

const Draw = () => {

    const [send, setSend] = useState(false)

    const [result, setResult] = useState()

    const sketch = useRef()

    const hundleSubmit = () => {
        const canvas = sketch.current.toDataURL()
        // console.log(canvas)
        // saveAs(canvas, 'Test.jpg')
        const Default = "data:image/png;base64,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"
        if (canvas === Default) {
            // console.log("empty field");
        } else {
            sendData(canvas);
        }

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
                // console.log(res.data)
                setSend(true)
                getImageResult(res.data.id)
            })
            .catch(err => {
                console.log(err)
            })

    }

    const getImageResult = (id) => {
        // console.log(id)
        axios.get(`http://localhost:8000/api/digits/${id}/`)
            .then(res => {
                // console.log(res.data)
                var str = res.data.result;
                var result = str.replace(/\D/g, "");
                setResult(result)
            })
            .catch(err => {
                console.log(err)
            })
    }

    return (
        <React.Fragment>
            <div className="row">
                <h1
                    style={{
                        color: 'grey',
                        margin: '0 auto',
                        paddingBottom: '15px',
                    }}
                > HANDWRITTEN DIGIT RECOGNITION </h1>
            </div>
            <div className="row">
                <h5
                    style={{
                        color: 'grey',
                        margin: '0 auto',
                        paddingBottom: '50px',
                    }}
                ><a href="https://colab.research.google.com/drive/1XwXhwwgq86tXWHISteLFjOV32aynSv-2?usp=sharing">Github link</a></h5>
            </div>
            <div className="row">
                <SketchField
                    ref={sketch}
                    onChange={hundleSubmit}
                    width='400px'
                    height='400px'
                    tool={Tools.Pencil}
                    backgroundColor="white"
                    lineColor="black"
                    imageFormat='jpg'
                    lineWidth={20}
                    style={styles.draw}
                />
            </div>
            {/* <br />
            <br />
            <br /> */}
            <div className="row">
                <h5
                    style={{
                        color: 'grey',
                        margin: '0 auto',
                        paddingTop: '20px',
                        paddingBottom: '10px',
                    }}
                > {send && <p> I Think This is a "{result}"? </p>} </h5>
            </div>
            <div className="row">
                <Button
                    onClick={hundleReset}
                    className="button"
                    style={styles.center}
                > Redraw </Button>
            </div>
            <div className="footer" style={{ color: 'grey', }}>
                Made In ENSIAS. By Bender & Benhima. Supervised by Mme Benbrahim.
            </div>
            {/* {send && <Alert variant="info"> Success Send </Alert>}
            {result && <Alert variant="info"> Result is { result } </Alert>} */}
        </React.Fragment>
    );
}

export default Draw;