

import * as React from "react"
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { File } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/context/admin/fetchDataContext"
import { ParentRegistrationSchema } from "@/validators/parentSchema"
import { z } from "zod"
import SheetDemo from "./editParent"
import { useTranslations } from "next-intl"
import { exportTableToExcel } from "@/components/excelExport"
export type ParentSummary = {
    id: string;
    parent: string;
    joiningDate: string;
    numberOfChildren:number;
    paymentStatus:string;
    payment:number;
 
  };
type Status = 'Active' | 'Alert' | 'Warning';
export type parent = {
    id: string;
    parent: string;
    numberOfChildren: string;
    joiningDate: string;
    payment: number;
    paymentStatus:Status
    

  };

  
  type ParentFormValues = z.infer<typeof ParentRegistrationSchema>  & {id:string };

  export const DataTableDemo = () => {
    const [open,setOpen]=React.useState(false)
      const {parents,setParents}=useData()
   
      const t=useTranslations()
      const [parent,setParent]=React.useState<ParentFormValues>({  
      id:"dqwd",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date("1990-01-01"),
      gender: "male",
      address: "123 Main Street",
      city: "Anytown",
      state: "California",
      postalCode: "12345",
      country: "USA",
      parentEmail: "parent@example.com",
      parentPhone: "+1234567890",
      numberOfChildren: 2,
      secondParentName: "Jane Doe",
      secondParentPhone: "+1987654321",
      paymentStatus: "Active",
      totalPayment: 10000})
    const getStatusColor = React.useCallback((status:Status) => {
      switch (status) {
        case 'Active':
          return '#2ECC71'; // Green for accepted
        case 'Alert':
          return '#F1C40F'; // Yellow for pending
        case 'Warning':
          return '#E74C3C'; // Red for rejected
        default:
          return '#FFFFFF'; // Default to white for unknown status
      }
    }, []);
    
   const columns: ColumnDef<ParentFormValues>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "parent",
      header: () => <div className="">{t('parent')}</div>,

      cell: ({ row }) => (
        <div className="capitalize">
           <div className="font-medium">{row.getValue("parent")}</div>
                              <div className="hidden text-sm text-muted-foreground md:inline">
                              {row.getValue("email")}
                              </div>
        </div>
      ),
    },
    {
      accessorKey: "numberOfChildren",
      header: () => <div>{t('number-of-children-0')}</div>,

      cell: ({ row }) => <div className="lowercase hidden sm:table-cell">{row.getValue("numberOfChildren")}</div>,
    },
    {
      accessorKey: "paymentStatus",
      header: () => <div >{t('payment-status-0')}</div>,

      cell: ({ row }) => (
        <Badge   className="capitalize hidden sm:table-cell" style={{backgroundColor:getStatusColor(row.getValue("paymentStatus"))}}>{t(row.getValue("paymentStatus"))}</Badge>
      ),
    },
    {
      accessorKey: "parentPhone",
      header: () => <div>{t('phone-number')}</div>,

      cell: ({ row }) => <div className="lowercase hidden sm:table-cell">{row.getValue("parentPhone")}</div>,
    },
    {
      accessorKey: "totalPayment",
      header: () => <div className="text-right">{t('total-payment-0')}</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalPayment"))
  
        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "DZD",
        }).format(amount)
  
        return <div className="text-right font-medium">{formatted}</div>
      },
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const parent = row.original
  
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t('open-menu')}</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
             
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={()=>openEditSheet(parent)}>
                {t('view-parent')} </DropdownMenuItem>
              {/* <DropdownMenuItem>View payment details</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
  const handleExport = () => {
    const exceldata=parents.map((parent:any)=>({[`${t('Name')}`]:parent.parent,
    [`${t('number-of-children-0')}`]:parent.numberOfChildren,
    [`${t('payment-status-0')}`]:t(parent.paymentStatus),
    [`${t('phone-number')}`]:parent.parentPhone,
    [`${t('total-payment-0')}`]: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
    }).format(parent.totalPayment),
    }))
    exportTableToExcel(t('parents-table'), exceldata);
  };
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const openEditSheet = (parent:ParentFormValues) => {
        setParent(parent)
        setOpen(true); // Open the sheet after setting the level
      };
    
  const table = useReactTable({
    data:parents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageIndex: 0, //custom initial page index
        pageSize: 3, //custom default page size
      },
    },
  })

 


  
  return (
    <>
<div className="flex items-center justify-between">
       

    <Input
          placeholder={t('filter-parent-0')}
          value={(table.getColumn("parent")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("parent")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
          <div className="flex items-center ml-auto">
    <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {t('columns')} <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {t(column.id)}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" className="ml-2" onClick={handleExport}>
       {t('export')} <File className="ml-2 h-4 w-4" />
      </Button>
    </div>
    </div>
  
    <Card x-chunk="dashboard-05-chunk-3">
    <CardHeader className="px-7">
      <CardTitle>{t('your-parents')}</CardTitle>
      <CardDescription>
      {t('introducing-our-dynamic-parent-dashboard-for-seamless-management-and-insightful-analysis')} </CardDescription>
    </CardHeader>
    <CardContent>     
    <div className="w-full">
 
      <div className="rounded-md border">
        <Table id="parents-table">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t('no-results')} </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} {t('row-s-selected')}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t('previous')} </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t('next')} </Button>
        </div>
      </div>
    </div>
    <SheetDemo open={open} setOpen={setOpen}  parent={parent}/>

    </CardContent>
  </Card>
  </>
  )
}