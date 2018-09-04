{
    let vm = new MVVM({
        el:'.positive',
        data:{
            info:{
                name:'张凯君',
                job:'前端工程师'
            }
        },
        methods:{
            sayHi(){
                console.log(this.name)
            }
        }
    })
}

