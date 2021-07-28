import React, {useEffect, useState} from 'react'
import { useDispatch } from 'react-redux';
import { getCartItems, removeCartItem } from '../../../_actions/user_actions';
import UserCardBlock from './Sections/UserCardBlock'
import { Empty } from 'antd';

function CartPage(props) {
    const dispatch = useDispatch();

    const [Total, setTotal] = useState(0)
    const [ShowTotal, setShowTotal] = useState(false)       // 가격 표시

    useEffect(() => {
        // cart에 있는 상품의 id가 같으면 합쳐줄 것임
        let cartItems=[]        

        // 리덕스 User State의 Cart 안에 상품이 들어있는지 확인
        if(props.user.userData && props.user.userData.cart){
            if(props.user.userData.cart.length >0){
                props.user.userData.cart.forEach(item => {
                    cartItems.push(item.id)                             // cartItems은 cart의 요소들의 id를 담는 배열 
                })

                dispatch(getCartItems(cartItems, props.user.userData.cart))     // user의 cart 정보(props.user.userData.cart)를 product에 합쳐줘야 함
                .then(response => {calculateTotal(response.payload)})                    // 콘솔 창에서 가져온 정보가 무엇인지 확인
            }
        }
        
    }, [props.user.userData])


    let calculateTotal = (cartDetail) => {
        let total = 0;

        cartDetail.map(item => {
            total += parseInt(item.price, 10)* item.quantity
        })
        setTotal(total)
        setShowTotal(true)                 
    }

    let removeFromCart = (productId) =>{
        dispatch(removeCartItem(productId))     // removeCartItem이라는 액션
            .then(response => {                 // 액션 수행 이후 할 것(=삭제 버튼 누르고 삭제 된 다음에 할 것)
                if(response.payload.productInfo.length <= 0){
                    setShowTotal(false)            // 가격 표시X
                }
            })


    }

    return (
        <div style={{ width: '85%', margin: '3rem auto' }}>
            <h1>My Cart</h1>

            <div>
                <UserCardBlock products={props.user.cartDetail} removeItem={removeFromCart}/>
            </div>

            {ShowTotal ? 
                <div style={{ marginTop: '3rem' }}>
                    <h2>Total Amount: ${Total}</h2>
                </div>
                :
                <>
                    <br />
                    <Empty description={false}/>
                </>
            }

            
        </div>
    )
}

export default CartPage
