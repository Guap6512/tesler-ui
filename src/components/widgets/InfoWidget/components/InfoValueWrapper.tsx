import cn from 'classnames'
import React, {ReactNode} from 'react'
import styles from './InfoValueWrapper.less'
import {Col} from 'antd'
import {WidgetInfoMeta} from 'interfaces/widget'

interface ValueWrapperProps {
    row: {
        cols: Array<{fieldKey: string, span?: number}>
    }
    col: {fieldKey: string, span?: number}
    meta: WidgetInfoMeta,
    children?: ReactNode
}
const InfoValueWrapper: React.FunctionComponent<ValueWrapperProps> = props => {
    return <Col span={props.col.span}>
        <div className={cn(styles.fieldArea, {[styles.columnDirection]: props.row.cols.length > 1})}>
            {props.children}
        </div>
    </Col>
}

export default React.memo(InfoValueWrapper)
