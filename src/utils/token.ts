const useToken = {
    getToken() {
        return localStorage.getItem('__token__')
    },
    setToken(token: string) {
        localStorage.setItem('__token__', token)
    },
    removeToken() {
        localStorage.removeItem('__token__')
    },
}

export default useToken
