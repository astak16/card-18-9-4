{
    let vm = new MVVM({
        el:'.positive',
        data:{
            info:{
                name:'张凯君',
                job:'应聘：前端开发'
            }
        },
        methods:{
            sayHi(){
                console.log(this.name)
            }
        }
    })
}

