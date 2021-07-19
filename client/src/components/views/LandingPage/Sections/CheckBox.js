import React from 'react'
import { Collapse, Checkbox } from 'antd';

const { Panel } = Collapse;

function CheckBox(props) {  // LandingPage.js에서 list 속성으로 continetns(나라 리스트) 전달받음

    const renderCheckBosLists = () => props.list && props.list.map((value, index) => (
        <React.Fragment key={index}>
            <Checkbox onChange>
                <span> {value.name} </span>
            </Checkbox>
        </React.Fragment>
    ))
    
    return (
        <div>
            <Collapse defaultActiveKey={['1']}>
                <Panel header="This is panel header with arrow icon" key="1">
                    {renderCheckBosLists()}
                </Panel>
            </Collapse>
        </div>
    )
}

export default CheckBox
