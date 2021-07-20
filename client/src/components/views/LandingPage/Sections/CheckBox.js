import React, { useState } from 'react'
import { Collapse, Checkbox } from 'antd';

const { Panel } = Collapse;

function CheckBox(props) {                          // LandingPage.js에서 list 속성으로 continetns(나라 리스트) 전달받음
    
    const [Checked, setChecked] = useState([])      // 어떤 항목이 체크되었는지

    const handleToggle = (value) => {               // 체크 박스 선택 시
        // 누른 것의 index를 구하고 
        const currentIndex = Checked.indexOf(value)     // 몇번 index인지 반환. 없으면 -1

        const newChecked = [...Checked]

        // 전체 Checked된 dtate에서 현재 누른 Checkbox가 이미 있다면
        if(currentIndex === -1){
            newChecked.push(value)              // state 넣어주고
        } else{ 
            newChecked.splice(currentIndex, 1)  // 빼주고
        }

        setChecked(newChecked)
        props.handleFilters(newChecked)          // 부모 컴포넌트에 전달, handleFilters가 받음(?)
    }

    const renderCheckBoxLists = () => props.list && props.list.map((value, index) => (
        <React.Fragment key={index}>
            <Checkbox onChange={()=> handleToggle(value._id)} 
                    checked={Checked.indexOf(value._id) === -1 ? false: true} />
                <span> {value.name} </span>
        </React.Fragment>
    ))
    
    return (
        <div>
            <Collapse defaultActiveKey={['1']}>
                <Panel header="This is panel header with arrow icon" key="1">
                    {renderCheckBoxLists()}
                </Panel>
            </Collapse>
        </div>
    )
}

export default CheckBox