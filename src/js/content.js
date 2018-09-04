{
    let vm = new MVVM({
        el:'.content',
        data:{
            info:{
                phone:'186*******',
                email:'15***@qq.com',
                address:'上海',
                winxin:'186****'
            }
        },
        methods:{
            ddd(){
                console.log(this.phone)
            }
        }
    })
}