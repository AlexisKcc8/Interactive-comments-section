export const ajax = async (props)=>{
    let {url, cbSuccess, cbError} = props;

    try {
        let res = await fetch(url);
        if(res.status === 200) {
            let json = await res.json();
            cbSuccess(json);
        }else{
            throw {status: res.status, statusText: res.statusText}
        }
    } catch (err) {
        cbError(err)
    }
}