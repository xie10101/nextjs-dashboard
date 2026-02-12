"use client";
import { useState } from "react";   
import {registerUser} from '../lib/actions';
import { useActionState } from "react";
export default function RegisterForm() { 
     
     const [state, dispatch] = useActionState(registerUser, {
        message: "",
     });
     return ( 
         <form action={dispatch} className="flex flex-col space-y-4"> 
             <div className="flex flex-col">
                 <label htmlFor="username" className="text-sm font-medium text-gray-700">用户名</label>
                 <input
                     id="username"
                     name="username"
                     type="text"
                     className="mt-1 p-2 border border-gray-300 rounded-md"
                     required
                 />
             </div>
             <div className="flex flex-col">
                 <label htmlFor="email" className="text-sm font-medium text-gray-700">邮箱</label>
                 <input
                     id="email"
                     name="email"
                     type="email"
                     className="mt-1 p-2 border border-gray-300 rounded-md"
                     required
                 />
             </div>
             <div className="flex flex-col">
                 <label htmlFor="password" className="text-sm font-medium text-gray-700">密码</label>
                 <input
                     id="password"
                     name="password"
                     type="password"
                     className="mt-1 p-2 border border-gray-300 rounded-md"
                     required
                     minLength={6}
                 />
             </div>
             <button
                 type="submit"
                 className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
             >
                 Register
             </button>
             <div>
                      {state?.message && <p className="text-red-500">{state.message}</p>}
             </div>
         </form>
    );
}
