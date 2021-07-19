import React, {useState} from 'react'

import Dropzone from 'react-dropzone'
import {Icon} from 'antd'
import axios from 'axios';

function FileUpload(props) {
    const [Images, setImages] = useState([])

    const dropHandler = (files) => {
        // 파일 전송 시 추가 코드
        let formData = new FormData();
        const config = {
            header: {'content-type': 'mulipart/form-data'}  // 서버에서 request를 받을 때 에러 발생하지 않게해줌
        }
        formData.append("file", files[0])     // formData안에 파일의 정보들이 들어 있다.
        
        // 서버로 전송
        axios.post('/api/product/image', formData, config )
        .then(response => {                 // data를 성공적으로 받아오면 client가 할 일 (아래와 같다)
            if(response.data.success){
                
                console.log(response.data)
                setImages([...Images, response.data.filePath])      // 이미지 state에 저장된 것 전부
                props.refreshFunction([...Images, response.data.filePath])

            } else{
                alert('파일을 저장하는데 실패했습니다.')
            }
        })
    }

    const deleteHandler = (image) => {
        const currentIndex = Images.indexOf(Image)

        let newImages = [...Images]     // 새로운 배열에 기존 이미지 복사
        newImages.splice(currentIndex, 1)

        setImages(newImages)    // 하나가 지워진 새로운 state가 나옴

        //부모 컴포넌트인 UploadProductPage.js에 정보 전달 (server에 submit할 수 있게)
        props.refreshFunction([newImages])
    }
 
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between'}}>
            <Dropzone onDrop={dropHandler}>
            {({getRootProps, getInputProps}) => (
                <section>
                <div style={{
                    width: 300, height:240, border:'apx solid lightgray', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} 
                    {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Icon type="plus" style={{ fontSize:'3rem' }}/>
                </div>
                </section>
            )}
            </Dropzone>

            <div style ={{ display:'flex', width: '350px', height:'240px', overflowX: 'scroll'}}>
                {Images.map((image, index) => (
                    <div onClick={()=>deleteHandler(image)} key={index}>
                        <img style ={{ minWidth: '300px', width: '300px', height: '240px' }}
                        src = {`http://localhost:5000/${image}`}/>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FileUpload
