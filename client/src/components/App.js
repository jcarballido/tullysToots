import React, { useState, useEffect } from 'react';
//import '../tailwind.css';

// Shared Components
const Container = ({ children }) => {
    return(
        <div className='w-screen min-h-screen bg-violet-800 flex justify-center items-center'>
            { children }
            <Footer />
        </div>
    )
}

const Copyright = () => {
    return(
        <div className='flex flex-col'>
            <div className="flex justify-center items-center">COPYRIGHT 2024</div>
            <div className="flex justify-center items-center">TULLY'S TOOTS</div>
        </div>
    )
}

const Footer = () => {
    return(
        <footer className='w-3/4 flex justify-center items-center'>
            <Copyright />
        </footer>
    )
}

const CredentialsModal = ({ children }) => {
    return(
        <main className='min-w-max max-w-[1/3] flex flex-col border-2 border-black'>
            { children }
        </main>
    )
}

const Logo =() => {
    return(
        <div className='h-4 grow-0'>
            <img src='logo'/>
        </div>
    )
}

const TextInput = ({ inputName }) => {
    const [value, setValue] = useState('')

    const handleInputChange = (e) => {
        e.preventDefault()
        const target = e.target
        const input = target.value
        setValue(input)
    }

    return(
        <label for={`${inputName.toLowerCase()}`} className='flex flex-col items-start'>
            {`${inputName}`}:
            <input id={`${inputName.toLowerCase()}`} type='text' onChange={handleInputChange} />
        </label>
    )
}
// Login Page

const LoginForm = () => {
    return(
        <form className='border-2 border-black flex flex-col max-w-max'>
            <TextInput inputName={'Username'} />
            <TextInput inputName={'Password'} />
            <button type='submit'>Submit</button>
            New to Tully's Toots?
            <button>
                <a href='/signup'>Create an account</a>
            </button > 
        </form>
    )
}

const LoginPage = () => {
    return(
        <Container>
            <CredentialsModal>
                <Logo />
                <div>
                    Welcome Back!
                </div>
                <LoginForm />
            </CredentialsModal>
        </Container>
    )
}

// Sign Up Page

const SignUpForm = () => {
    return(
        <form className='border-2 border-black flex flex-col max-w-max'>
            <TextInput inputName={'Email'} />
            <TextInput inputName={'Username'} />
            <TextInput inputName={'Password'} />
            <button type='submit'>Submit</button>
            Already have an account?
            <button>
                <a href='/signup'>Sign in</a>
            </button > 
        </form>
    )
}

const SignUpPage = () => {
    return(
        <Container>
            <CredentialsModal>
                <Logo />
                <div>
                    Welcome!
                </div>
                <SignUpForm />
            </CredentialsModal>
        </Container>
    )
}

// Account Page
// Allow for...Adding pets, Removing Pets, Sharing Pet Activity, Updating Profile
const User = () => {
    return(
        <div>
            {Username}
        </div>
    )
}

const Dashboard = ({ children }) => {
    return(
        <main className='flex w-3/4 min-h-5/6'>
            { children }
        </main>
    )
}

const Navigation = ({ active, setActive}) => {
    
    const links = ['Profile', 'Pets', 'Invitations']
    // Profile...
    // Username
    // Email
    // Password
    // Pets...
    // List of pets and their info...
    // Name
    // DOB
    // Sex
    // Invitations...
    // Email form
    // Pets to share activity with

    
    const handleNavClick = (e) => {
        e.preventDefault()
        const target = e.target
        const link = target.textContent.trim()
        setActive(link)
    }

    return(
        <nav classNames='min-w-max grow-0'>
            <User />
            {
                links.map( link => {
                    return(
                        <button onClick={handleNavClick}>
                            {link}
                        </button>
                    )
                })
            }
            <Invitations />
        </nav>
    )
}

const Content = ({ active }) => {
    return(
        <div className='min-w-max grow-1'>
            {active == 'Profile'? <Profile />:null}
            {active == 'Pets'? <Pets />:null}
            {active == 'Invitations'? <Invitations />:null}
        </div>
    )
}

const Profile = () => {

    const [ active,setActive ] = useState('profile')

    return(
        <Container>
            <Dashboard>
                <Navigation active={active} setActive={setActive}/>
                <Content active={active}/>
            </Dashboard>
        </Container>
    )
}

const App = () => {

    return (
        <>
            <LoginPage />
        </>
    )
}
export default App
