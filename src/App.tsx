import React, { FC } from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'

import {
  Column,
  ColumnDef,
  ColumnOrderState,
  flexRender,
  getCoreRowModel,
  Header,
  Table,
  useReactTable,
} from '@tanstack/react-table'
import { makeData, Person } from './makeData'

import { useDrag, useDrop } from 'react-dnd'

import { Parser } from 'node-sql-parser'
const parser = new Parser();


const defaultColumns: ColumnDef<Person>[] = [
  {
    accessorKey: 'firstName',
    id: 'firstName',
    header: 'First Name',
    cell: info => info.getValue(),
    footer: props => props.column.id,
  },
  {
    accessorFn: row => row.lastName,
    id: 'lastName',
    cell: info => info.getValue(),
    header: () => <span>Last Name</span>,
    footer: props => props.column.id,
  },
  {
    accessorKey: 'age',
    id: 'age',
    header: 'Age',
    footer: props => props.column.id,
  },

  {
    accessorKey: 'visits',
    id: 'visits',
    header: 'Visits',
    footer: props => props.column.id,
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: 'Status',
    footer: props => props.column.id,
  },
  {
    accessorKey: 'progress',
    id: 'progress',
    header: 'Profile Progress',
    footer: props => props.column.id,
  },
]

const reorderColumn = (
  draggedColumnId: string,
  targetColumnId: string,
  columnOrder: string[],
  astColumns: any[]
): [ColumnOrderState, any[]] => {
  const aIndex = columnOrder.indexOf(targetColumnId);
  const bIndex = columnOrder.indexOf(draggedColumnId);
  columnOrder.splice(
    aIndex, 0, columnOrder.splice(bIndex, 1)[0] as string
  )
  astColumns.splice(
    aIndex, 0, astColumns.splice(bIndex, 1)[0] as any
  )

  return [[...columnOrder], [...astColumns]]
}

const DraggableColumnHeader: FC<{
  header: Header<Person, unknown>
  table: Table<Person>,
  astState: any,
  setAstState: any
}> = ({ header, table, astState, setAstState }) => {
  const { getState, setColumnOrder } = table
  const { columnOrder } = getState()
  const { column } = header

  const [, dropRef] = useDrop({
    accept: 'column',
    drop: (draggedColumn: Column<Person>) => {
      const [newColumnOrder, newColumns] = reorderColumn(
        draggedColumn.id,
        column.id,
        columnOrder,
        astState.columns,
      )

      setColumnOrder(newColumnOrder);
      setAstState({
        ...astState,
        columns: newColumns
      })
    },
  })

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => column,
    type: 'column',
  })

  return (
    <th
      ref={dropRef}
      colSpan={header.colSpan}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div ref={previewRef}>
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        <button ref={dragRef}>🟰</button>
      </div>
    </th>
  )
}

export function App() {
  const [data, setData] = React.useState(() => makeData(20))
  const [columns] = React.useState(() => [...defaultColumns])

  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    columns.map(column => column.id as string) //must start out with populated columnOrder so we can splice
  )

  const sqlQuery = `
  SELECT 
    firstName,
  lastName,
  age,
  visits,
  status,
  progress
  FROM 
  my_namespace.my_table 
  WHERE
  progress < 100
  GROUP BY status
  ORDER BY lastName
  `

  const opt = {
    database: 'MySQL' // MySQL is the default database
  }

  const ast = parser.astify(sqlQuery); // mysql sql grammer parsed by default
  console.log({ ast })
  const [astState, setAstState] = React.useState(() => ast)

  const sql = parser.sqlify(astState, opt);

  const regenerateData = () => setData(() => makeData(20))

  const resetOrder = () =>
    setColumnOrder(columns.map(column => column.id as string))



  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  })



  console.log(ast);
  return (
    <div className="p-2">
      <div className="h-4" />
      <div className="flex flex-wrap gap-2">
        <button onClick={() => regenerateData()} className="border p-1">
          Regenerate
        </button>
        <button onClick={() => resetOrder()} className="border p-1">
          Reset Order
        </button>
      </div>
      <div className="h-4" />
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <DraggableColumnHeader
                  key={header.id}
                  header={header}
                  table={table}
                  astState={astState}
                  setAstState={setAstState}
                />
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map(footerGroup => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map(header => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <pre>{JSON.stringify(table.getState().columnOrder, null, 2)}</pre>
      <hr />
      <pre>{sql}</pre>
    </div>
  )
}
