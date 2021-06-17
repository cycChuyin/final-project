// console.log('hello');
const orderList = document.querySelector('.js-orderList');
//後台訂單資料
let orderData = [];

//初始化渲染
function  init(){
    getOrderList();
    // renderC3();
}
init();

//取得C3圖表
function renderC3(){
    console.log(orderData);
    //物件資料搜集
    let total={};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category] == undefined){
                total[productItem.category] = productItem.price * productItem.quantity;
            }else{
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    })
    console.log(total);
    //做出資料關聯
    let cartgoryAry = Object.keys(total);
    console.log(cartgoryAry);
    let newData = [];
    cartgoryAry.forEach(function(item){
        let ary = [];
        ary.push(item); //["收納", "caegory"]
        ary.push(total[item]);//{收納: 4230, "caegory": 3600, "caegory": 72000}
        console.log(ary)//["床架", 72000]
        newData.push(ary);
        
    })
    

    // C3.js
    let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns:newData
    },
});
}

//取得訂單，跑render
function getOrderList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,
        { 
        headers:{
        "Authorization": token,
        }  
    })
    .then(function(response){
        console.log(response.data)
        //將取得的api文件資料訂單放入陣列
        orderData = response.data.orders;
        //跑 forEach 顯示出來
        let str ='';
        orderData.forEach(function(item){
            //將資料的時間改成前台樣的樣子，組時間字串
            //抓出目前的時間點 
            //new Date 要帶毫秒 13碼
            const timeStamp = new Date(item.createdAt * 1000);
            const orderCreatAtTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;
            console.log(orderCreatAtTime);


            //組產品字串
            //將orderData 內 item 的 products 跑 forEach 把資料抓出來
            let productStr = '';
            item.products.forEach(function(productItem){
                productStr += `<p> ${productItem.title} Ｘ (${productItem.quantity})</p>`;
            })

            //判斷訂單處理狀態
            //訂單狀態的字
            let orderStatus="";
                if(item.paid==true){
                    orderStatus="已處理"
                }else{
                orderStatus = "未處理"
                }

            //組訂單全部表格字串
            str += `<tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
              ${productStr}
            </td>
            <td>${orderCreatAtTime}</td>
            <td class="orderStatus">
              <a href="#" class="js-orderStatus" data-id="${item.id}" data-status="${item.paid}">${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
            </td>
        </tr>`
        })
        //在orderList顯示出來
        orderList.innerHTML = str;
        //重新抓orderList的資料
        renderC3();
    })
}

//訂單狀態被點擊
orderList.addEventListener('click',function(e){
    //阻擋跳轉
    e.preventDefault();
    const targetClass = e.target.getAttribute('class');
    console.log(e.target);
    console.log(targetClass);
    //判斷是否點擊正確
    let orderListId = e.target.getAttribute("data-id");

    if(targetClass == "delSingleOrder-Btn js-orderDelete" ){
        // alert('你點擊到刪除按鈕');
        deletOrderItem(orderListId);
        return;
    }

    if(targetClass == "js-orderStatus"){
        // console.log(e.target.getAttribute("data-status"));
        let status = e.target.getAttribute("data-status");
        changeOrderStatus(status,orderListId);
        return;
    }
})

//改變訂單狀態
function changeOrderStatus(status,orderListId){
    console.log(status,orderListId);
    let newStatus;
    if(status == true){
        newStatus = false;
    }else{
        newStatus = true;
    };
    //變更訂單的值
    axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,
    {   
        "data": {
            "id": "訂單 ID (String)",
            "paid": newStatus
          }

    },
        { 
        headers:{
        "Authorization": token,
        }  
    })
    .then(function(response){
        alert('訂單修改成功');
        getOrderList(); //重新渲染
    })
}

//刪除訂單
function deletOrderItem(orderListId){
    // console.log(orderListId);
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${orderListId}`,
        { 
        headers:{
        "Authorization": token,
        }  
    })
    .then(function(response){
        alert('刪除該筆訂單成功');
        getOrderList();//重新渲染
    })
}