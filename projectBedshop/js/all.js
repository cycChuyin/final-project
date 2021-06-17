console.log(api_path,token);

const productList= document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shopping-tableList');
const discardAllBtn = document.querySelector(".discardAllBtn");

//新增新空陣列，將產品資訊放進去
let productData=[];
//新增購物車陣列
let cartData=[];

// 初始化，渲染資料
function init(){
    getProductList();
    getCartList();
}
init();

//render 需要重複使用的渲染程式
function renderProductList(){
    //使用forEach 將productData資料拉出來，將HTML上產品列表使用js重構
    let str = '';
    productData.forEach(function(item){
        str += `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="">
        <a href="#" class="js-addCart" data-id=${item.id}>加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
        </li>`
    })
    productList.innerHTML = str;
    }

//取得產品列表 連接api ，記得抓取axios CDN
function getProductList(){
    //取得api文件資料
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
        // console.log(response.data.products);
        //將api文件裡的產裡資料新增至空陣列
        productData = response.data.products;
        //使用forEach 將productData資料拉出來，將HTML上產品列表使用js重構
        //因將列表改用成renderProductList函式，所以呼叫renderProductList呈現
        renderProductList();
        })

}

//函式消除重複性，重組字串
//加入data-id=${item.id} 使用「加入購物車功能」
function combineProductHTMLItem(item){ //記得加item，因為有使用forEach
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" data-id=${item.id}>加入購物車</a> 
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
    </li>`
}

//製作分類productSelect監聽
productSelect.addEventListener('change',function(e){
    //檢查一下值
    console.log(e.target.value);

    const category = e.target.value;
    //篩選條件
    if(category == '全部'){
        renderProductList(); //顯示全部的列表
        return;
    }
    let str = '';
    productData.forEach(function(item){
        if(item.category == category){
            str += combineProductHTMLItem(item);
        }
    })
    productList.innerHTML = str;
})

productList.addEventListener('click',function(e){
    e.preventDefault(); //阻擋
    // console.log(e.target.getAttribute("data-id"));

    //確認點擊到的是加入購物車
    let addCartClass = e.target.getAttribute("class");
    if(addCartClass !== "js-addCart"){
        return;
    }
    //取得 id 用post新增更改資料
    //點擊「加入購物車」後得到產品id
    let productId = e.target.getAttribute("data-id");
    let numCheck = 1; 
    
    cartData.forEach(function(item){
        if (item.product.id === productId) { //檢查購物車裡有無這筆資料
            numCheck = item.quantity += 1; //增加數量
            console.log(numCheck);
        }
    })
    //post 更新資料，加入購物車
    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`,{
            "data": {
            "productId": productId,
            "quantity": numCheck
            }
    })
        .then(function(response){
            console.log(response);
            alert("加入購物車");
            getCartList(); //記得重新渲染到畫面上
        })
})

//取得購物車列表
function getCartList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        // console.log(response);
        //計算總金額
        console.log(response.data.finalTotal);
        document.querySelector('.js-finalTotal').textContent = response.data.finalTotal;

        cartData = response.data.carts;   
        
        let str = '';
        cartData.forEach(function(item){
            str += ` <tr>
            <td>
            <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT$${item.product.price}</td>
        <td>${item.quantity}</td>
        <td>NT$${item.product.price * item.quantity}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id=${item.id}> 
                clear
            </a>
        </td>
        </tr>`
        });
        // const cartList = document.querySelector('.shopping-tableList');
        cartList.innerHTML = str;
    })
}


//刪除指定購物車項目
//針對購物車列表裡綁監聽
cartList.addEventListener('click',function(e){
    e.preventDefault();
    console.log(e.target);
//先在「加入購物車」補上 data-id
//檢查有無id
    const cartId = e.target.getAttribute("data-id");
    //防止亂點擊
    if(cartId == null){
        alert("你沒有點擊到");
        return;
    }
    console.log(cartId);
    //axios 刪除文件 刪除指定資料
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(response){
        alert("已刪除該筆購物車資料");
        getCartList(); //重新渲染
    })
})

//刪除全部購物車
//監聽
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        alert('刪除全部購物車成功');
        getCartList(); //重新渲染
    })
    //錯誤判斷
    .catch(function(response){
        alert('購物車已清空，請勿重複點擊');
    })
})

//產生訂單api流程
//送出預定資料綁監聽
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault();
    // console.log('你被點擊了');
    //觀察是否有滿足兩條件（1.詳填訂單資訊 2.購物車裡有品項）
    if(cartData.length == 0){
        alert('購物車裡沒有品項，請加入購物車');
        return;
    }

    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const customerTradeWay = document.querySelector('#tradeWay').value;
    console.log(customerName,customerPhone,customerEmail,customerAddress);
    //符合全部填滿的條件
    if (customerName == '' || customerPhone == '' || customerEmail == '' || customerAddress == ''){
        alert('請詳填資料');
    }

    //連接order api
    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": customerTradeWay
            }
          }
    })
    .then(function(response){
        alert('訂單建立成功');
        //送出訂單後清空填寫資料空格
        document.querySelector('#customerName').value ='';
        document.querySelector('#customerPhone').value ='';
        document.querySelector('#customerEmail').value ='';
        document.querySelector('#customerAddress').value ='';
        document.querySelector('#tradeWay').value ='ATM';
        getCartList();
    })
})


