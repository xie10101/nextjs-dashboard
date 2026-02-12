// ts 文件 -- 服务端执行 - 纯函数 
'use server';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth'; // 错误类型 
import { z } from 'zod';
import { db } from '../database/orm_database';
import { invoices } from '../database';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import {users} from '../database/users';
//创建 数据结构 schema  
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
/**
 * 为 action 进行返回值的的设置 ：
 *  {
 *  message:"xx"
 *  }
 *  
 */

// 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
//然后可以基于它快速生成各种“精简版”  -- 业务和处理逻辑 - id 不填 - date 自动生成 -当前创建日期 
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
//  没有的添加 
export async function createInvoice( prevState: State, formData: FormData) {
    const validationResult = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  console.log(validationResult)
  // Test it out:
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validationResult.data; // data获取数据 
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try{
  await db.insert(invoices).values({
    customer_id: customerId,
    amount: amountInCents,
    status: status,  
    date: date,
  });
  revalidatePath('/dashboard/invoices'); 
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
    // 报错错误的处理可能不好直观显示和用户理解，所以这里返回一个 message 字段
  }
     redirect('/dashboard/invoices');
}


const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ... 
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100
  try{
      await db.update(invoices)
    .set({
      customer_id: customerId,
      amount: amountInCents,
      status: status,
    })
    .where(eq(invoices.id, id));
 
  revalidatePath('/dashboard/invoices');
  }catch(error){
    console.error('Database Error:', error);
    throw new Error('Failed to update invoice.'); 
  }
  redirect('/dashboard/invoices');
  // redirect 是在 try/catch 块之外调用的。这是因为 redirect 的工作方式是通过抛出一个错误，该错误会被 catch 块捕获。
}

export async function deleteInvoice(id: string) {

  try{
   await db.delete(invoices).where(eq(invoices.id, id));
  revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete invoice.');
  }
}

// 验证 登录 表单数据
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

// 注册用户
export async function registerUser(prevState: { message: string }|undefined, formData: FormData) {
  console.log(formData)
  const name = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  // 表单校验 - zod 做 
  const RegisterSchema = z.object({
    username: z.string().min(3, "用户名至少 3 个字符"),
    email: z.string().email("请输入有效的邮箱"),
    password: z.string().min(6, "密码至少 6 个字符"),
  });

  try {
    RegisterSchema.parse({
      username: name,
      email: email,
      password: password,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { message: error.errors.map((e) => e.message).join(", ") };
    }
    throw error;
  }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.insert(users).values({
        name: name,
        email: email,
        password: hashedPassword,
    });
      await signIn('credentials', 
        {
          email: email,
          password: password,
          redirectTo: '/dashboard',
        }
      );
  // 此处逻辑完整执行，但抛出错误的原因 ？ 
}
