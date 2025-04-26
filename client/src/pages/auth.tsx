import Background from '@/assets/login2.png'
import Victory from '@/assets/victory.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { LOGIN_ROUTES, SIGNUP_ROUTES } from '@/constants'
// import { LOGIN_ROUTES, SIGNUP_ROUTES } from '@/constants'
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import { TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner';


function Auth() {
    const navigate = useNavigate();
    const {setUserInfo} = useAppStore();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const validateSignup = ()=>{
        if(!email.length){
            toast.error('Email is required.');
            return false
        } else if(!password.length){
            toast.error('Password is required.');
            return false
        } else if(password !== confirmPassword){
            toast.error('Password and Confirm Password should be same.');
            return false
        } else {

        }
        return true;
    }

    const validateLogin = ()=>{
        if(!email.length){
            toast.error('Email is required.');
            return false
        } else if(!password.length){
            toast.error('Password is required.');
            return false
        } else {

        }
        return true;
    }
    const handleLogin = async ()=>{
       if(validateLogin()){
         const response = await apiClient.post(LOGIN_ROUTES,{email,password},{withCredentials:true});
         if(response.data._id){
            setUserInfo(response.data);
            if(response.data.profileStatus){
                navigate('/chat');
            } else{
                navigate('/profile');
            }
        }
       }
    }

    const handleSignup = async ()=>{
        if(validateSignup()){
        const response = await apiClient.post(SIGNUP_ROUTES,{email,password},{withCredentials:true});
        console.log({response})
        if(response.status == 201){
            setUserInfo(response.data);
            navigate('/profile');
        }
        }
    }
    return (
        <div className="h-[100vh] w-[100vw] flex items-center justify-center">
            <div className="h-[80vh] bg-white border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
                <div className="flex flex-col gap-10 items-center justify-center">
                    <div className="flex items-center justify-center flex-col">
                        <div className="flex items-center justify-center">
                            <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
                            <img src={Victory} alt='' className='h-[100px]' />
                        </div>
                        <p className='font-medium text-center'>
                            Fill in the details to get started with best chat app!
                        </p>
                    </div>
                    <div className='flex items-center justify-center w-full'>
                        <Tabs className='w-3/4' defaultValue='login'>
                            <TabsList className='bg-transparent rounded-none w-full'>
                                <TabsTrigger className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300' value='login'>Login</TabsTrigger>
                                <TabsTrigger className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300' value='signup'>Signup</TabsTrigger>
                            </TabsList>
                            <TabsContent className='flex flex-col gap-5' value='login'>
                                <Input placeholder='Email' type='email' className='rounded-full p-6' value={email} onChange={(e) => setEmail(e.target.value)} />
                                <Input placeholder='Password' type='password' className='rounded-full p-6' value={password} onChange={(e) => setPassword(e.target.value)} />
                                <Button className='rounded-full p-6' onClick={handleLogin}>Login</Button>
                            </TabsContent>
                            <TabsContent className='flex flex-col gap-5' value='signup'>
                            <Input placeholder='Email' type='email' className='rounded-full p-6' value={email} onChange={(e) => setEmail(e.target.value)} />
                                <Input placeholder='Password' type='password' className='rounded-full p-6' value={password} onChange={(e) => setPassword(e.target.value)} />
                                <Input placeholder='Confirm Password' type='password' className='rounded-full p-6' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                <Button className='rounded-full p-6' onClick={handleSignup}>Signup</Button>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <div className='hidden xl:flex justify-center items-center'>
                    <img src={Background} className='h-[700px]'/>
                </div>
            </div>
        </div>
    )
}

export default Auth
