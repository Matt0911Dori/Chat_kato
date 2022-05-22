'use strict';

/**
 * import
 */
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries
    import { getDatabase, ref, push, set, onChildAdded, remove, onChildRemoved }
        from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.6.0/firebase-database.min.js";
  

/**
 * Config定義
 */
// Your web app's Firebase configuration
    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "XXXXXXX",
        authDomain: "kadai-chat-1.firebaseapp.com",
        projectId: "kadai-chat-1",
        storageBucket: "kadai-chat-1.appspot.com",
        messagingSenderId: "530192595780",
        appId: "1:530192595780:web:a7622b6df17486c5e73511"

};


/**
 * 変数定義
 */
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, "chat");
const userRef = ref(db, "user");
const adminRef = ref(db, "admin");


const js_send = document.getElementById('js_send');
const js_userName = document.getElementById('js_userName');
const js_text = document.getElementById('js_text');
const js_output = document.getElementById('js_output');
const js_user = document.getElementById('js_user');
const js_admin = document.getElementById('js_admin');
const js_fire = document.getElementById('js_fire');
const js_counter = document.getElementById('js_counter');


js_user.addEventListener('click', function () {
    const pass = "*****";// パスワード
    let pw = prompt("パスワード");
    if (pw !== pass) {
        return;
    }

    let name = prompt("name");
    let ip = prompt("ip");
    let data = prompt("data");

    const user = {
        name: name,
        ip: ip,
        data: data,
    }
    const newUserRef = push(userRef);//ユニークキーを付ける
    set(newUserRef, user);//ユニークキーのついたオブジェクト内にuserをset

    alert(JSON.stringify(userArray));//出力
});
//push
let userArray = [];
onChildAdded(userRef, function (data) {
    const user = data.val();
    //配列にpush
    userArray.push({ name: user.name, ip: user.ip, data: user.data });
    // console.log(userArray);
});


/* adminIp */
//add
js_admin.addEventListener('click', function () {
    const pass = "*****";// パスワード
    let pw = prompt("パスワード");
    if (pw !== pass) {
        return;
    }

    let name = prompt("name");
    let ip = prompt("ip");
    let data = prompt("data");
    //userオブジェクトへまとめる
    const admin = {
        name: name,
        ip: ip,
        data: data,
    }
    const newAdminRef = push(adminRef);//ユニークキーを付ける
    set(newAdminRef, admin);//ユニークキーのついたオブジェクト内にuserをset

    alert(JSON.stringify(adminArray));//出力
});
//push
let adminArray = [];
onChildAdded(adminRef, function (data) {
    const admin = data.val();
    //配列にpush
    adminArray.push({ name: admin.name, ip: admin.ip, data: admin.data });
    // console.log(adminArray);
});

/***************************************/
/*メイン処理
/***************************************/
/**
 * メッセージ送信
 */
let counter = 0;
js_send.addEventListener('click', function () {
    counter++;

    /* name,msgともにないと送信キャンセル */
    if (js_text.value === '') {
        return;
    }
    if (js_userName.value === '') {
        alert('Nameを入力して下さい');
        return;
    }


    /* time */
    let now = new Date();
    let Year = now.getFullYear();
    let Month = (now.getMonth() + 1).toString().padStart(2, '0');
    let DATE = now.getDate().toString().padStart(2, '0');
    let Hour = now.getHours().toString().padStart(2, '0');
    let Min = now.getMinutes().toString().padStart(2, '0');
    let time = `${Year}/${Month}/${DATE} ${Hour}:${Min}`

    /* ip */
    fetch('https://ipinfo.io?callback') //ipアドレスをAPI経由で取得
        .then(res => res.json())
        .then(json => myFunction(json.ip))//関数でipアドレスを取り出す


    /* ipアドレスを関数内で使用 */
    function myFunction(ip_address) {

        const user_ip = String(ip_address); //取得したipアドレスを文字列化

        //ユーザー情報リストから一致するipアドレスがあればuserへ代入
        let user = userArray.filter(function (item, index) {
            if (item.ip === user_ip) return true;
        });
        // userのlengthが0ではない＝一致するIPアドレスがある
        let pickUpName;
        if (user.length !== 0) {
            pickUpName = user[0].name;//userは配列で取得されるので添字[0] そのなかのkey name:の中身を取得
            // console.log('userリストと一致');
        } else {
            pickUpName = "不明";//一致しなければ"不明"
        }

        //ipアドレス非表示リストから一致するipアドレスがあればadminへ代入
        let admin = adminArray.filter(function (item, index) {
            if (item.ip === user_ip) return true;
        });
        // adminのlengthが0ではない＝一致するIPアドレスがある
        if (admin.length !== 0) {
            ip_address = ""; //admin=adminのipアドレスは非表示へ
            // console.log('adminリストと一致');
        }

        //msgオブジェクトへまとめる
        const msg = {
            userName: js_userName.value,
            pickUpName: pickUpName,
            text: js_text.value,
            time: time,
            ip: ip_address,
            no: counter,
        }


        const newPostRef = push(dbRef);//ユニークキーを付ける
        set(newPostRef, msg);//ユニークキーのついたオブジェクト内にmsgをset

        // 送信後入力欄クリア
        js_userName.value = '';
        js_text.value = '';

    }

});

/**
 * メッセージ受信
 */
onChildAdded(dbRef, function (data) {
    const msg = data.val();
    // const key = data.key; //今回使ってない

    /* 名前 */
    let o_name = document.createElement('span');  // 要素作成
    o_name.className = 'msg__name'; //class
    o_name.innerHTML = `${msg.userName}`; //名前

    /* ipと紐付いた名前 */
    let o_pickUpName = document.createElement('span');  // 要素作成
    o_pickUpName.className = 'msg__pick-up-name'; //class
    o_pickUpName.innerHTML = `投稿者:${msg.pickUpName}`; //名前

    /* time */
    let o_time = document.createElement('span');
    o_time.className = 'msg__time';
    o_time.innerHTML = `${msg.time}`;

    /* ip */
    let o_ip = document.createElement('span');
    o_ip.className = 'msg__ip';
    o_ip.innerHTML = `${msg.ip}`;

    /* ラップ用のpタグ生成 */
    let p = document.createElement('p');
    p.className = 'msg-box';

    /* pタグへ追加 */
    p.appendChild(o_name);
    // p.appendChild(o_pickUpName); "投稿者:"非表示
    p.appendChild(o_time);
    // p.appendChild(o_ip); "IPアドレス:"非表示

    /* メッセージ本体 */
    let o_msg = document.createElement('p');
    o_msg.className = 'msg__text';
    o_msg.innerHTML = `${msg.text}`;

    /* 全体のラッパー */
    let div = document.createElement('div');
    div.className = 'msg';

    /* 全体のラッパーへpタグ,メッセージ追加 */
    div.appendChild(p);
    div.appendChild(o_msg);

    /* カウンター */
    js_counter.textContent = msg.no;

    /* js_outputコンテナーに追加 */
    js_output.appendChild(div);

    /* 下までスクロール */
    js_output.scrollTop = js_output.scrollHeight;

});


/***************************************/
/*その他処理
/***************************************/
/* firebaseへ移動 */

js_fire.addEventListener('click', function () {
    const pass = "*****";// パスワード
    let pw = prompt("パスワード");
    if (pw !== pass) {
        return;
    }

    window.open('https://console.firebase.google.com/project/sample-1181f/database/sample-1181f-default-rtdb/data?hl=ja', '_blank');

});