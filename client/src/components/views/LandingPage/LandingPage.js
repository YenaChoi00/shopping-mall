import React, { useEffect, useState } from 'react'
import { FaCode } from "react-icons/fa";
import axios from "axios";
import { Icon, Col, Card, Row} from 'antd';
import Meta from 'antd/lib/card/Meta';
import { set } from 'mongoose';
import CheckBox from './Sections/CheckBox';
import { continents } from './Sections/Datas';

function LandingPage() {

    const [Products, setProducts] = useState([])
    const [Skip, setSkip] = useState(0)
    const [Limit, setLimit] = useState(8)
    const [PostSize, setPostSize] = useState(0)

    useEffect(() => {

        let body = {    // request보낼 때 같이 보냄
            skip: Skip,
            limit: Limit
        }

        getProducts(body)   // 처음에 랜딩 화면 접속 시 수행
        
    }, [])

    const getProducts = (body) => {
        axios.post('/api/product/products', body ) // 랜더링 후 바로 작동되는 부분, 더보기 버튼 누르고 작동하는(request보내는) 부분
            .then(response => {
                if (response.data.success){
                    if(body.loadMore){  // (1) 더보기 버튼을 눌러서 refresh되었을 때는
                        setProducts([...Products, ...response.data.productInfo]) // (2) 기존정보(...Product)+새정보 띄운다.
                    } else{
                        setProducts(response.data.productInfo)
                    }
                    console.log("setProducts후 Products: ", Products)
                    setPostSize(response.data.postSize)                 
                }else{
                    alert("상품들을 가져오는데 실패했습니다.")
                }
            })
    }

    const loadMoreHandler = () => {     // 더보기 눌렀을 때 수행
        let skip = Skip + Limit         // 더보기 눌렀을 때 새로운 skip 값
        
        let body={
            skip: skip,
            limit: Limit,
            loadMore: true      /* 이 동작은 더보기 버튼을 눌러서 가져온 것이라는 의미 */
        }

        getProducts(body)  
        setSkip(skip)           /* 변한 skip값 저장 */
    }

    const renderCards = Products.map((product, index) => {  // map은 product 하나씩 관리하기 위한 메소드
        /* 큰 화면(lg)일 때 하나는 6size(한 줄에 4개), 제일 작은 화면(xs)일 때 하나는 24size(한 줄에 1개) */
        return <Col lg={6} md={8} xs={24} key={index}> 
            <Card            
                cover={<img style={{ width: '100%', maxHeight: '150px'}} 
                src={`http://localhost:5000/${product.images[0]}`}/>}
                >
                <Meta 
                    title={product.title}
                    description={`$${product.price}`}   // 가격
                />
            </Card>
        </Col>
    })

    return (
        <div style={{ width: '75%', margin: '3rem auto'}}>
            <div style={{ textAlign: 'center'}}>
                <h2> Let's Travel Anywhere <Icon type="rocket"/> </h2>
            </div>

            { /* filter */}

            { /* CheckBox */}
            <CheckBox list={continents} />

            { /* RadioBox */}

            { /* Search */}

            { /* Cards */}
        <Row gutter={[16, 16]}>
            {renderCards}
        </Row>
        <br />

        {PostSize >= Limit &&
            <div style= {{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={loadMoreHandler}>더보기</button>
            </div>
        }
        </div>
    )
}

export default LandingPage