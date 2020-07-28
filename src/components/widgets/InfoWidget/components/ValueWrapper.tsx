import cn from 'classnames'
import React, {ReactNode} from 'react'
import styles from './ValueWrapper.less'
import {Col} from 'antd'
import {WidgetInfoField, WidgetInfoMeta} from 'interfaces/widget'

interface ValueWrapperProps {
    field: WidgetInfoField
    row: {
        cols: Array<{fieldKey: string, span?: number}>
    }
    col: {fieldKey: string, span?: number}
    totalWidth: number
    colIndex: number
    meta: WidgetInfoMeta,
    children?: ReactNode
}
const ValueWrapper: React.FunctionComponent<ValueWrapperProps> = props => {
    return <Col
        span={props.col.span}
        className={cn({[styles.colWrap]: props.row.cols.length > 1})}
    >
        <div className={cn(styles.fieldArea,
            {[styles.noFieldSeparator]: props.meta.options?.fieldBorderBottom === false},
            {[styles.fieldDirection]: props.row.cols.length > 1})}
        >
            {props.children}
        </div>
    </Col>
}

export default React.memo(ValueWrapper)
