import bcrypt from 'bcrypt';

const usuarios = [
    {
        nombre:'Thiago',
        email: 'thiago@gmail.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    },
    {
        nombre:'Demian',
        email: 'demi@demi.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default usuarios;