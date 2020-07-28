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
    return <Col key={props.field.key} span={props.col.span} className={cn(
        {[styles.colWrap]: props.row.cols.length > 1},
        {
            [styles.rightCol]: props.col.span
            && props.totalWidth > 24
            && props.colIndex !== 0
            && props.row.cols.length % (props.colIndex + 1) === 0
        },
        {
            [styles.leftCol]: props.col.span
            && props.totalWidth > 24
            && props.row.cols.length % (props.colIndex + 1) !== 0
            || props.colIndex === 0
            && props.col.span
        })
    }
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
