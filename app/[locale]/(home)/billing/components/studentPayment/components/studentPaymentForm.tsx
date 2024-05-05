
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {ResetIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { studentPaymentSchema } from "@/validators/studentPaymentSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useState} from "react";
import { useToast } from "@/components/ui/use-toast";
import CalendarDatePicker from "@/app/[locale]/(home)/students/components/date-picker";
import { ScrollArea} from "@/components/ui/scroll-area";
import ImageUpload from "@/app/[locale]/(home)/students/components/uploadFile";
import Combobox from "@/components/ui/comboBox";
import { LoadingButton } from "@/components/ui/loadingButton";
import { z } from "zod";
import { useData } from "@/context/admin/fetchDataContext";
import { addPaymentTransaction } from "@/lib/hooks/billing/student-billing";
import { uploadFilesAndLinkToCollection } from "@/context/admin/hooks/useUploadFiles";

const fieldNames: string[] = [
  'student',
  'parent',
  'level',
  'class',
  "amountLeftToPay",
  'paymentPlan',
  'paymentAmount',
  'nextPaymentDate',
  'paymentTitle',
  'paymentDate',
  'fromWho',
  'typeofTransaction',
  'status',
  'description',

];


type FormKeys =
  | 'paymentTitle'
  | 'paymentAmount'
  | 'paymentDate'
  | 'typeofTransaction'
  | 'fromWho'
  | 'student'
  |'description'
  | 'parent'
  | 'level'
  | 'class'
  | 'paymentPlan'
  |  "amountLeftToPay"
  |  'nextPaymentDate'
  | 'status';

type StudentPaymentFormValues = z.infer<typeof studentPaymentSchema>;
function addMonthsToDate(date: Date, monthsToAdd: number): Date {
  const newDate = new Date(date.getTime()); // Create a copy of the original date
  newDate.setMonth(newDate.getMonth() + monthsToAdd); // Add months to the date
  return newDate;
}

function parsePaymentPlan(paymentPlan: string, startDate: Date): Date | null {
  const match = paymentPlan.match(/(\d+)\s+months?/i); // Match the number of months in the string
  if (match) {
    const months = parseInt(match[1]); // Extract and parse the number of months
    return addMonthsToDate(startDate, months); // Add months to the startDate and return the new date
  }
  return null; // Return null if the paymentPlan string does not match the expected format
}
const typeofTransaction = [
  {
    value: "CreditCard",
    label: "Credit Card",
  },
  {
  value: "Cash",
  label: "Cash",
    },
 
];

const studentPaymentStatus =[
  
  {
    value:"paid"  ,
    label: "Paid",
  },
  {
    value:"notPaid"  ,
    label: "Not Paid",
  },
]
interface FileUploadProgress {
  file: File;
  name: string;
  source:any;
}
export default function StudentPaymentForm() {
  const { toast } = useToast();
  const {students,levels,setInvoices,setStudents,setAnalytics}=useData()
  const [status, setstatus] = useState(false);
  const [openTypeofpayment, setOpenTypeofpayment] = useState(false);
  const [studentModal,setStudentModal]=React.useState(false)
  const [paymentPlanModal,setPaymentPlanModal]=React.useState(false)
  const [filesToUpload, setFilesToUpload] = useState<FileUploadProgress[]>([]);
  const form = useForm<StudentPaymentFormValues>({
    resolver: zodResolver(studentPaymentSchema),
  });
  const { reset, formState, setValue, getValues,watch } = form;
  const { isSubmitting } = formState;


const paymentPlans = React.useMemo(() => {
  const studentValue = form.getValues("level");

  
  if (studentValue) {
    const selectedLevel = levels.find((level:any) => level.level === studentValue);

    if (selectedLevel) {

      return selectedLevel.prices.map((price:any)=>({...price,label:price.name,value:price.name}));
    }
  }
  return [];
}, [form,watch('level')]);
const onSelected=(selectedStudent:any)=>{
  form.setValue("class",selectedStudent.class.name)
  form.setValue("parent",selectedStudent.parent)
  form.setValue("level",selectedStudent.level)
  form.setValue("amountLeftToPay",selectedStudent.amountLeftToPay)
}
  const renderInput = (fieldName:string, field:any) => {
    switch (fieldName) {
      case "paymentDate":
        return (
          <CalendarDatePicker
            {...field}
            date={getValues("paymentDate")}
            setDate={(selectedValue) => {
              if (selectedValue === undefined) {
                // Handle undefined case if needed
              } else {
                form.setValue(fieldName, selectedValue);
              }
            }}
          />
        );
        case "student":
          return (
            <Combobox
              {...field}
              open={studentModal}
              setOpen={setStudentModal}
              placeHolder="Student"
              options={students}
              value={getValues("student")?.student}
              onSelected={(selectedValue) => {
                const selectedStudent = students.find((student:any) => student.value === selectedValue);
                if (selectedStudent) {
                  const { value, label, ...rest } = selectedStudent; 
                  const updatedStudent:any = { ...rest };
                  onSelected(updatedStudent); 
                  form.setValue(fieldName, {value:selectedStudent.value,label:selectedStudent.label,id:selectedStudent.id,student:selectedStudent.student,nextPaymentDate:selectedStudent.nextPaymentDate}); 
                }
              }}
         
            />

          );
 
      case "status":
        return (
          <Combobox
            {...field}
            open={status}
            setOpen={setstatus}
            placeHolder="status"
            options={studentPaymentStatus}
            value={getValues("status")}
            onSelected={(selectedValue) => {
              form.setValue(fieldName, selectedValue);
            }} // Set the value based on the form's current value for the field
          />
        );
      case "typeofTransaction":
        return (
          <Combobox
            {...field}
            open={openTypeofpayment}
            setOpen={setOpenTypeofpayment}
            placeHolder="typeofTransaction"
            options={typeofTransaction}
            value={getValues("typeofTransaction")}
            onSelected={(selectedValue) => {
 
              form.setValue(fieldName, selectedValue);
            }}
          />
        );
        
        case "paymentAmount":
            return (<Input {...field} onChange={event => field.onChange(+event.target.value)}/>)

        case "parent" :
          return (<Input {...field}  value={getValues("parent")?.name} readOnly/>)
          
        case "level" :
          return (<Input {...field}  value={getValues("level")} readOnly/>)

        case "paymentPlan":
          return (
            <Combobox
            {...field}
            open={paymentPlanModal}
            setOpen={setPaymentPlanModal}
            placeHolder="Payment plan"
            options={paymentPlans}
            value={getValues("paymentPlan")?.name}
            onSelected={(selectedValue) => {
              const paymentPlan = paymentPlans?.find(
                (plan:any) => plan?.value === selectedValue
              );
              if (paymentPlan) {
                form.setValue(fieldName, paymentPlan)
                form.setValue("paymentAmount",paymentPlan.price)
                
                const newDate = parsePaymentPlan(paymentPlan.period, getValues("student").nextPaymentDate);
                if(newDate){
                  form.setValue("nextPaymentDate",newDate)

                }
              }
            }}
          />

          )
          case "nextPaymentDate":
            return (<Input {...field} value={field.value?.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} readOnly/>)
                      default:
        return <Input {...field} />;
    }
  };

  async function onSubmit(data:StudentPaymentFormValues) {
    const transactionId=await addPaymentTransaction({...data,documents:[]})
    const uploaded = await uploadFilesAndLinkToCollection("Billing/payments/Invoices", transactionId, filesToUpload);
    setInvoices((prev:StudentPaymentFormValues[])=>[{...data,id:transactionId,invoice:transactionId,
    value:transactionId,
    label:transactionId,
    documents:uploaded},...prev])
    setStudents((prev:any) => {
      const updatedLevels = prev.map((student:any) =>
        student.id === data.student.id ? { ...data,nextPaymentDate:data.nextPaymentDate,
          amountLeftToPay:data.amountLeftToPay-data.paymentAmount }: student
      );
      return updatedLevels;
    });
    setAnalytics((prevState:any) => ({
      data: {
        ...prevState.data,
        jan: {
          ...prevState.data.jan,
          income:prevState.data.jan.income + data.paymentAmount
        }
      },
      totalIncome: prevState.totalIncome +  data.paymentAmount
    }));  
          toast({
              title: "invoicet added!",
              description: "Student invoice added Successfully",
            });
    console.log(data);
            reset(); 
  }

  return (
    <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Create Payment
          </CardTitle>
          <CardDescription></CardDescription>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={() => reset()}
          >
            <ResetIcon className="h-3.5 w-3.5" />
            <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
              Reset details
            </span>
          </Button>
        </div>
      </CardHeader>
      <ScrollArea
        className="overflow-auto pt-6 text-sm"
        style={{ maxHeight: "600px" }}
      >
        <CardContent>
          <Form {...form}>
            <form>
              {fieldNames.map((fieldName, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={fieldName as FormKeys}
                  render={({ field }) => (
                    <FormItem style={{ marginBottom: 15 }}>
                      <FormLabel>{fieldName}</FormLabel>
                      <FormControl>{renderInput(fieldName, field)}</FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </form>
          </Form>
          <ImageUpload filesToUpload={filesToUpload} setFilesToUpload={setFilesToUpload}/>

        </CardContent>
      </ScrollArea>
      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
        <div className="flex gap-2">
          <LoadingButton
            loading={isSubmitting}
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
          >
            Submit
          </LoadingButton>
        </div>
      </CardFooter>
    </Card>
  );
}