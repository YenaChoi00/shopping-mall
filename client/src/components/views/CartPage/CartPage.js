import React, {useEffect} from 'react'
import { useDispatch } from 'react-redux';
import { getCartItems, removeCartItem, onSuccessBuy } from '../../../_actions/user_actions';

function CartPage(props) {
    const dispatch = useDispatch();

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
            }
        }
        
    }, [])
    return (
        <div>
            cartpage
        </div>
    )
}

export default CartPage
