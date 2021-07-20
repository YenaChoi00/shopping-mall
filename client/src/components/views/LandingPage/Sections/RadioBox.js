import React, { useState } from 'react'
import { Collapse, Radio } from 'antd';

const { Panel } = Collapse;

function RadioBox(props) {
    const [Value, setValue] = useState(0)

    const renderRadioBox = () => (
        props.list && props.list.map(value => (
            <Radio key={value._id} value={value._id}> {value.name} </Radio>
        ))
    )

    const handleChange = (event) => {               // 버튼을 누를 때마다 state 변경
        setValue(event.target.value)
        props.handleFilters(event.target.value)     // 부모에 state값 전달
    }


    return (
        <div>
            <Collapse defaultActiveKey={['1']}>
                <Panel header="Price" key="1">
                    <Radio.Group onChange={handleChange} value={Value}>
                        {renderRadioBox()}
                    </Radio.Group>
                </Panel>
            </Collapse>
        </div>
    )
}

export default RadioBox
