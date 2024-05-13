import {reactive} from 'vue';
//use
export const auth = reactive({
    user: {
        username: localStorage.getItem('username')|| null,
        token: localStorage.getItem('username')|| null,
    },
    setAuth(username, token){
        this.username = username;
        this.token = token;
        localStorage.setItem('username' , username);
        localStorage.setItem('token' , token);
    },
    removeAuth(username, token){
        this.username = null;
        this.token = null;
        localStorage.removeItem('username');
        localStorage.removeItem('token');
    },
    getAuth(){
        return !!this.username && !!this.password;
    }
});