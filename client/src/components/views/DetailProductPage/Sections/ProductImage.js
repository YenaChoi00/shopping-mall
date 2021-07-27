import React, {useState, useEffect} from 'react'
import ImageGallery from 'react-image-gallery';

function ProductImage(props) {
    const [Images, setImages] = useState([])

    useEffect(() => {
        if(props.detail.images && props.detail.images.length > 0){
            let images = []
            props.detail.images.map(item => {
                images.push({
                    original: `http://localhost:5000/${item}`,     // 원래는 동적으로 주소 처리
                    thumbnail: `http://localhost:5000/${item}`
                })
            })
            setImages(images)
        }

    }, [props.detail])  // 첫 랜더링 이후엔 images가 없어서 아무것도 뜨지 않음.
                        // 첫 랜더링→ DB에 요청→ 값을 받아온 후→ props로 정보를 전달받음
                        // []안에 넣어주면 props.detail의 값이 변할 때마다 한번 더 랜더링하라는 의미다.
    

    return (
        <div>
            <ImageGallery items={Images}/>
        </div>
    )
}

export default ProductImage
