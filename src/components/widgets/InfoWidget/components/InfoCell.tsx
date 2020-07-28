import React from 'react'
import TemplatedTitle from 'components/TemplatedTitle/TemplatedTitle'
import {FieldType} from 'interfaces/view'
import cn from 'classnames'
import styles from './InfoCell.less'
import {DataItem, MultivalueSingleValue} from 'interfaces/data'
import Field from 'components/Field/Field'
import ActionLink from 'components/ui/ActionLink/ActionLink'
import {WidgetInfoField, WidgetInfoMeta} from 'interfaces/widget'
import InfoValueWrapper from './InfoValueWrapper'
import MultiValueListRecord from 'components/Multivalue/MultiValueListRecord'

interface ValueCellProps {
    row: {
        cols: Array<{fieldKey: string, span?: number}>
    }
    col: {fieldKey: string, span?: number}
    cursor: string,
    meta: WidgetInfoMeta,
    data: DataItem,
    flattenWidgetFields: WidgetInfoField[]
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void,
}
const emptyMultivalueField = [] as MultivalueSingleValue[]
export const InfoCell: React.FunctionComponent<ValueCellProps> = props => {
    const field = props.flattenWidgetFields.find(item => item.key === props.col.fieldKey)
    const isMultiValue = field.type === FieldType.multivalue

    const separateDrillDownTitle = field.drillDown &&
        (field.drillDownTitle || field.drillDownTitleKey && props.data[field.drillDownTitleKey])
    const handleDrillDown = React.useCallback(
        () => {
            props.onDrillDown(props.meta.name, props.data.id, props.meta.bcName, field.key)
        },
        [
            props.onDrillDown,
            props.meta.name,
            props.data.id,
            props.meta.bcName,
            field.key
        ]
    )

    const ResultField = isMultiValue
        ? ((props.data[field.key] || emptyMultivalueField) as MultivalueSingleValue[]).map((multiValueSingleValue, index) => {
            return <MultiValueListRecord
                key={index}
                isFloat={false}
                multivalueSingleValue={multiValueSingleValue}
            />
        })
        : <>
            {(field.hintKey && props.data[field.hintKey]) &&
            <div className={styles.hint}>
                {props.data[field.hintKey]}
            </div>
            }
            <Field
                bcName={props.meta.bcName}
                cursor={props.cursor}
                widgetName={props.meta.name}
                widgetFieldMeta={field}
                className={cn({[styles.infoWidgetValue]: !!field.bgColorKey})}
                disableDrillDown={!!separateDrillDownTitle}
                readonly
            />
            {separateDrillDownTitle &&
            <div>
                <ActionLink onClick={handleDrillDown}>
                    {separateDrillDownTitle}
                </ActionLink>
            </div>
            }
        </>

    return <InfoValueWrapper
        key={field.key}
        row={props.row}
        col={props.col}
        meta={props.meta}
    >
        {(field.label?.length !== 0) &&
        <div className={styles.labelArea}>
            <TemplatedTitle
                widgetName={props.meta.name}
                title={field.label}
            />
        </div>
        }
        <div className={styles.fieldData}>
            {ResultField}
        </div>
    </InfoValueWrapper>
}

export default React.memo(InfoCell)
