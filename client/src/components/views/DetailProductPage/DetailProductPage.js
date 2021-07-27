import React, {useEffect, useState} from 'react';
import axios from 'axios'
import ProductImage from './Sections/ProductImage';
import ProductInfo from './Sections/ProductInfo';
import {Row, Col} from 'antd'

function DetailProductPage(props) {
    // 클릭한 상품의 id 가져오기
    const productId = props.match.params.productId

    const [Product, setProduct] = useState({})  // DB에서 가져온 정보들을 저장할거라 초기값이 객체

    useEffect(() => {
        // 백엔드 서버에 요청 보낸다
        axios.get(`/api/product/products_by_id?id=${productId}&type=single`)
        .then(response => {
            if(response.data.success) {
                console.log('response.data', response.data)
                setProduct(response.data.product[0])
            }else{
                alert('상세 정보 가져오기를 실패했습니다.')
            }
        })
    }, [])

    return (
        <div style={{ width: '100%', padding: '3rem 4rem' }}>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <h1>{Product.title}</h1>
            </div>

            <br />

            <Row gutter = {[16,16]}>    {/* 반응형 */}

                <Col lg={12} sm={24}>
                {/* ProductImage */}
                <ProductImage detail={Product}/>
                </Col>

                <Col lg={12} sm={24}>
                {/* ProductInfo */}
                <ProductInfo detail={Product} />
                </Col>
            </Row>

                
                
        </div>
    )
}

export default DetailProductPage
