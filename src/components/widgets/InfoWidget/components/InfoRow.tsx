import React from 'react'
import {Col, Row} from 'antd'
import styles from './InfoRow.less'
import cn from 'classnames'
import ValueCell from 'components/widgets/InfoWidget/components/ValueCell'
import {WidgetInfoField, WidgetInfoMeta} from 'interfaces/widget'
import {DataItem} from 'interfaces/data'
import {RowMetaField} from 'interfaces/rowMeta'

interface InfoRowProps {
    meta: WidgetInfoMeta,
    data: DataItem,
    flattenWidgetFields: WidgetInfoField[],
    fields: RowMetaField[],
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void,
    row: {
        cols: Array<{fieldKey: string, span?: number}>
    }
    cursor: string,
    index: number
}
const InfoRow: React.FunctionComponent<InfoRowProps> = props => {
    const totalWidth = props.row.cols.reduce((prev, current) => prev + current.span, 0)
    return <Row className={styles.rowWrapper}>
        {props.meta.options?.layout?.aside?.length > 0 && <Col span={5}>{props.meta.options.layout.aside[props.index]}</Col>}
        <Col
            span={props.meta.options?.layout?.aside?.length > 0 ? 19 : 24}
            className={cn(styles.mainCol, {[styles.extraWidth]: totalWidth > 24})}
        >
            {props.row.cols
            .filter(field => {
                const meta = props.fields?.find(item => item.key === field.fieldKey)
                return meta ? !meta.hidden : true
            })
            .map((col, colIndex) => {
                return <ValueCell
                    key={colIndex}
                    row={props.row}
                    col={col}
                    cursor={props.cursor}
                    meta={props.meta}
                    data={props.data}
                    flattenWidgetFields={props.flattenWidgetFields}
                    totalWidth={totalWidth}
                    colIndex={colIndex}
                    onDrillDown={props.onDrillDown}
                />
            })}
        </Col>
    </Row>

}

export default React.memo(InfoRow)
