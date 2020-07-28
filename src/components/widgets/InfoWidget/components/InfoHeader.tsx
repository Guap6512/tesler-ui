import React from 'react'
import {WidgetInfoMeta} from 'interfaces/widget'
import {Col, Row} from 'antd'
import styles from './InfoHeader.less'

interface InfoHeaderProps {
    meta: WidgetInfoMeta
}
const MAX_SPAN = 24
const WITH_ASIDE_SPAN = 19

export const InfoHeader: React.FunctionComponent<InfoHeaderProps> = props => {
    const header = props.meta.options?.layout?.header
    const headerLength = header?.length
    const headerPresent = headerLength > 0
    return headerPresent && <div className={styles.infoHeaderWrapper}>
        <Row className={styles.gridHeader}>
        <Col span={props.meta.options.layout.aside ? WITH_ASIDE_SPAN : MAX_SPAN}>
            {header.map((col, index) =>
                <Col key={index} span={MAX_SPAN / headerLength}>
                    {col}
                </Col>
            )}
        </Col>
    </Row>
    </div>
    // const options = props.meta.options
    // return options?.layout?.header?.length > 0 && <Row className={styles.gridHeader}>
    //     <Col span={options.layout.aside ? 19 : 24}>
    //         {options.layout.header.map((col, index) =>
    //             <Col key={index} span={24 / options.layout.header.length}>
    //                 {col}
    //             </Col>
    //         )}
    //     </Col>
    // </Row>

}

export default React.memo(InfoHeader)
