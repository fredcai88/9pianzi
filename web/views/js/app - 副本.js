// 页面元素
const elements = {
    // 查询相关
    phoneInput: document.getElementById('phone'),
    queryBtn: document.getElementById('queryBtn'),
    resultContainer: document.getElementById('resultContainer'),
    initialState: document.getElementById('initialState'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    resultList: document.getElementById('resultList'),

    // 详情弹窗相关
    detailModal: document.getElementById('detailModal'),
    detailContent: document.getElementById('detailContent'),
    closeDetailBtn: document.getElementById('closeDetailBtn'),
    closeDetailBtn2: document.getElementById('closeDetailBtn2'),

    // 新增弹窗相关
    addBtn: document.getElementById('addBtn'),
    addModal: document.getElementById('addModal'),
    closeAddBtn: document.getElementById('closeAddBtn'),
    closeAddBtn2: document.getElementById('closeAddBtn2'),
    addForm: document.getElementById('addForm'),
    addPhone: document.getElementById('addPhone'),
    addName: document.getElementById('addName'),
    addAddress: document.getElementById('addAddress'),
    addCity: document.getElementById('addCity'),
    addDate: document.getElementById('addDate'),
    addRemark: document.getElementById('addRemark'),
    submitBtn: document.getElementById('submitBtn'),
    resetBtn: document.getElementById('resetBtn'),
    phoneError: document.getElementById('phoneError'),
    remarkError: document.getElementById('remarkError')
};
const API_BASE_URL = "http://8.141.127.29:32123";
// 初始化页面
function init() {
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    elements.addDate.value = today;

    // 绑定事件监听
    bindEvents();
}

// 绑定事件监听
function bindEvents() {
    // 查询按钮点击事件
    elements.queryBtn.addEventListener('click', handleQuery);

    // 新增按钮点击事件
    elements.addBtn.addEventListener('click', () => showModal(elements.addModal));

    // 详情弹窗关闭事件
    elements.closeDetailBtn.addEventListener('click', () => hideModal(elements.detailModal));
    elements.closeDetailBtn2.addEventListener('click', () => hideModal(elements.detailModal));

    // 新增弹窗关闭事件
    elements.closeAddBtn.addEventListener('click', () => hideModal(elements.addModal));
    elements.closeAddBtn2.addEventListener('click', () => hideModal(elements.addModal));

    // 提交按钮点击事件
    elements.submitBtn.addEventListener('click', handleSubmit);

    // 重置按钮点击事件
    elements.resetBtn.addEventListener('click', () => {
        elements.addForm.reset();
        elements.addDate.value = new Date().toISOString().split('T')[0];
        hideErrors();
    });

    // 手机号输入验证
    elements.addPhone.addEventListener('input', () => {
        if (validatePhone(elements.addPhone.value.trim())) {
            elements.phoneError.classList.add('hidden');
        }
    });

    // 备注输入验证
    elements.addRemark.addEventListener('input', () => {
        if (elements.addRemark.value.trim()) {
            elements.remarkError.classList.add('hidden');
        }
    });

    // 点击弹窗背景关闭弹窗
    elements.detailModal.addEventListener('click', (e) => {
        if (e.target === elements.detailModal) {
            hideModal(elements.detailModal);
        }
    });

    elements.addModal.addEventListener('click', (e) => {
        if (e.target === elements.addModal) {
            hideModal(elements.addModal);
        }
    });

    // 回车键查询
    elements.phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleQuery();
        }
    });
}

// 处理查询
async function handleQuery() {
    const phone = elements.phoneInput.value.trim();

    if (!phone) {
        showToast('请输入手机号码');
        return;
    }

    // 显示加载状态
    showLoading();

    try {
        // 调用API查询数据
        const results = await api.queryByPhone(phone);
        //console.log("进到了这里1   ",results.length);
        // 显示结果
        if (results.length > 0) {
            //console.log("进到了这里3   ",results.length);
            showResults(results);
        } else {
            showEmpty();
        }
    } catch (error) {
        showToast('查询失败: ' + error.message);
        showInitial();
    }
}

// 处理提交
async function handleSubmit() {
    // 表单验证
    if (!validateForm()) {
        return;
    }

    // 收集表单数据
    const formData = {
        phone: elements.addPhone.value.trim(),
        personalName: elements.addName.value.trim(),
        address: elements.addAddress.value.trim(),
        cityName: elements.addCity.value.trim(),
        inputDate: elements.addDate.value,
        remark: elements.addRemark.value.trim()
    };

    try {
        //console.log(JSON.stringify(formData));
        // 调用API提交数据
        await api.addRecord(formData);

        // 关闭弹窗并提示
        hideModal(elements.addModal);
        showToast('新增成功');

        // 如果当前查询的是刚新增的手机号，自动刷新结果
        if (elements.phoneInput.value.trim() === formData.phone) {
            handleQuery();
        }

        // 重置表单
        elements.addForm.reset();
        elements.addDate.value = new Date().toISOString().split('T')[0];
    } catch (error) {
        showToast('提交失败: ' + error.message);
    }
}

// 表单验证
function validateForm() {
    let isValid = true;
    const phone = elements.addPhone.value.trim();
    const remark = elements.addRemark.value.trim();

    // 验证手机号
    if (!phone || !validatePhone(phone)) {
        elements.phoneError.classList.remove('hidden');
        isValid = false;
    } else {
        elements.phoneError.classList.add('hidden');
    }

    // 验证备注
    if (!remark) {
        elements.remarkError.classList.remove('hidden');
        isValid = false;
    } else {
        elements.remarkError.classList.add('hidden');
    }

    return isValid;
}

// 手机号验证
function validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

// 隐藏错误提示
function hideErrors() {
    elements.phoneError.classList.add('hidden');
    elements.remarkError.classList.add('hidden');
}

// 显示结果
function showResults(results) {
    elements.initialState.classList.add('hidden');
    elements.loadingState.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
    elements.resultList.classList.remove('hidden');

    // 清空现有结果
    elements.resultList.innerHTML = '';

    // 添加新结果
    results.forEach((item, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'p-4 hover:bg-gray-50 transition-colors cursor-pointer';
        resultItem.dataset.index = index;
        resultItem.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <p class="text-xs text-gray-500">日期</p>
          <p class="font-medium">${formatDate(item.inputDate)}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">地址</p>
          <p class="font-medium truncate">${item.address || '-'}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">城市</p>
          <p class="font-medium">${item.cityName || '-'}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">备注</p>
          <p class="font-medium truncate">${item.remark || '-'}</p>
        </div>
      </div>
    `;

        // 添加点击事件，显示详情
        resultItem.addEventListener('click', () => {
            showDetail(item);
        });

        elements.resultList.appendChild(resultItem);
    });
}

// 显示详情
function showDetail(item) {
    elements.detailContent.innerHTML = `
    <div class="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
      <span class="text-gray-500">手机号</span>
      <span class="col-span-2 font-medium">${formatPhone(item.personalPhone)}</span>
    </div>
    <div class="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
      <span class="text-gray-500">姓名</span>
      <span class="col-span-2 font-medium">${item.personalName || '-'}</span>
    </div>
    <div class="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
      <span class="text-gray-500">地址</span>
      <span class="col-span-2 font-medium">${item.address || '-'}</span>
    </div>
    <div class="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
      <span class="text-gray-500">城市</span>
      <span class="col-span-2 font-medium">${item.cityName || '-'}</span>
    </div>
    <div class="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
      <span class="text-gray-500">日期</span>
      <span class="col-span-2 font-medium">${formatDate(item.inputDate)}</span>
    </div>
    <div class="grid grid-cols-3 gap-2 py-2">
      <span class="text-gray-500">备注</span>
      <span class="col-span-2 font-medium">${item.remark || '-'}</span>
    </div>
  `;

    showModal(elements.detailModal);
}

// 显示加载状态
function showLoading() {
    elements.initialState.classList.add('hidden');
    elements.loadingState.classList.remove('hidden');
    elements.emptyState.classList.add('hidden');
    elements.resultList.classList.add('hidden');
}

// 显示无结果状态
function showEmpty() {
    elements.initialState.classList.add('hidden');
    elements.loadingState.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
    elements.resultList.classList.add('hidden');
}

// 显示初始状态
function showInitial() {
    elements.initialState.classList.remove('hidden');
    elements.loadingState.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
    elements.resultList.classList.add('hidden');
}

// 显示弹窗
function showModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 隐藏弹窗
function hideModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // 恢复背景滚动
}

// 显示提示消息
function showToast(message) {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-lg shadow-lg z-50 opacity-0 transition-opacity duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 显示toast
    setTimeout(() => {
        toast.classList.add('opacity-100');
    }, 10);

    // 3秒后隐藏toast
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}
// 手机号加密显示函数
function formatPhone(phone) {
    // 验证手机号格式（11位数字）
    if (!phone || typeof phone !== 'string' || phone.length !== 11 || !/^\d{11}$/.test(phone)) {
        return phone; // 非有效手机号则返回原始值
    }
    // 保留前3位和后2位，中间4位用*代替
    return phone.substring(0, 3) + '******' + phone.substring(9);
}
// 日期格式化工具函数
function formatDate(rawDate) {
    // 处理空值或无效日期
    if (!rawDate) return "无日期";

    // 将原始日期转为Date对象（兼容时间戳、ISO字符串等）
    const date = new Date(rawDate);

    // 检查日期是否有效
    if (isNaN(date.getTime())) return "无效日期";

    // 提取年、月、日（月份从0开始，需+1）
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 补0，确保两位数
    const day = String(date.getDate()).padStart(2, "0");

    // 可选：添加时分秒（根据需求调整）
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds =String(date.getSeconds()).padStart(2,"0");

    // 返回格式化后的日期（按需选择格式）
    return `${year}-${month}-${day}`; // 如：2024-08-09
    //return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // 如：2024-08-09 14:30
    // 其他格式示例：
    // return `${year}年${month}月${day}日`; // 2024年08月09日
    // return `${month}/${day}/${year}`; // 08/09/2024
}


// 格式化密钥为16位
function formatKey(key) {
    if (key.length < 16) {
        return key.padEnd(16, '0'); // 不足16位补0
    } else if (key.length > 16) {
        return key.substring(0, 16); // 超过16位截断
    }
    return key;
}

// 生成随机16位偏移量
function generateIv() {
    //return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Utf8);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let iv = '';
    for (let i = 0; i < 16; i++) {
        // 随机从字符集中选择一个字符
        const randomIndex = Math.floor(Math.random() * chars.length);
        iv += chars.charAt(randomIndex);
    }
    return iv;
}

// AES加密（CBC模式）
function encrypt(text, secretKey,iv) {
    const ivHex = CryptoJS.enc.Utf8.parse(iv);
    // 密钥处理：确保16位（AES-128），不足补全，过长截断
    const skey = CryptoJS.enc.Utf8.parse(formatKey(secretKey));
    const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(text),
        skey,
        {
            iv: ivHex,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );
    return encrypted.toString();
}
// API调用封装
const api = {
    // 模拟数据存储
    _data: [
        {
            phone: '13800138000',
            name: '张三',
            address: '北京市朝阳区建国路88号',
            city: '北京',
            date: '2023-06-15',
            remark: '首次记录'
        },
        {
            phone: '13900139000',
            name: '李四',
            address: '上海市浦东新区张江高科技园区',
            city: '上海',
            date: '2023-07-20',
            remark: '已更新信息'
        },
        {
            phone: '13800138000',
            name: '王五',
            address: '广州市天河区珠江新城',
            city: '广州',
            date: '2023-08-05',
            remark: '需要跟进'
        }
    ],

    // 根据手机号查询
    async queryByPhone(phone) {
        // 模拟API延迟
        //await new Promise(resolve => setTimeout(resolve, 800));

        // 实际项目中这里会是真实的API调用
        // return await fetch(`/api/query?phone=${phone}`).then(res => res.json());
        //return await fetch(`http://localhost:9999/datainfo/getinfoByPhone?phone=${phone}`).then(res => res.json()).then(data => console.log(data)).catch(error => console.log('Error:', error));

        /*return await fetch(`http://localhost:9999/datainfo/getinfoByPhone?phone=${encodeURIComponent(phone)}`,{method:'GET'})
            .then(response => {
                // 检查HTTP响应状态
                if (!response.ok) {
                    throw new Error(`HTTP错误，状态码: ${response.status}`);
                }*/
                // 2. 先获取原始文本响应（关键：确认后端实际返回的内容）
                /*return response.text().then(rawText => {
                    console.log("后端原始响应内容：", rawText); // 打印原始文本，确认格式

                    // 3. 尝试解析为JSON（如果原始文本是JSON格式）
                    try {
                        return JSON.parse(rawText); // 解析成功则返回JSON对象/数组
                    } catch (parseError) {
                        // 解析失败时抛出错误（比如后端返回了非JSON格式的字符串）
                        throw new Error(`JSON解析失败：${parseError.message}，原始内容：${rawText}`);
                    }
                });*/
                // 1. 先获取原始响应文本（关键：排查后端返回的实际内容）
                /*const rawText = response.text();
                console.log("后端原始响应内容:", rawText); // 打印原始文本，查看是否为有效JSON

                // 3. 尝试解析JSON（单独用try-catch捕获解析错误）
                try {
                    const data = JSON.parse(rawText);
                    // 确保返回数组（兼容后端可能的非数组格式）
                    const datalist= Array.isArray(data) ? data : [];
                    console.log('datalist查询到的记录数:', datalist.length);
                    // 关键：确保返回的是数组（兼容后端可能的异常返回）
                    return datalist;
                } catch (parseError) {
                    throw new Error(`JSON解析失败: ${parseError.message}，原始内容: ${rawText}`);
                }

                // 解析JSON数据
                //return response.json();
            })
            .then(dataList => {
                // 关键：确保数据是数组（即使后端返回null也转为空数组）
                const safeDataList = Array.isArray(dataList) ? dataList : [];

                // 现在可以安全地访问length属性了
                console.log('查询到的记录数:', safeDataList.length);
                console.log('数据：',safeDataList);
                console.log("数据类型：", Object.prototype.toString.call(safeDataList)); // 打印类型（数组/对象/其他）
                // 处理数据...
                // 5. 遍历数组（如果有数据）
                if (safeDataList.length > 0) {
                    console.log("第一条数据：", safeDataList[0]);

                    // 示例：打印所有数据的phone字段
                    safeDataList.forEach((item, index) => {
                        console.log(`第${index + 1}条数据的手机号：`, item.personalPhone || "未找到手机号");
                    });
                } else {
                    console.log("没有查询到数据");
                }

            })
            .catch(error => {
                console.error('查询失败:', error.message);
            });*/

        // 模拟查询逻辑
        //return this._data.filter(item => item.phone.includes(phone));
        try {

            // 从后端获取RSA公钥（推荐动态获取，而非硬编码）
            const publicKeyRes = await fetch(API_BASE_URL+'/api/getPublicKey');
            const publicKey = await publicKeyRes.text();
            //console.log(publicKey);
            // 初始化加密器并加密手机号
            RsaEncryptor.init(publicKey);
            let encryptedPhone = RsaEncryptor.encryptPhone(phone);
            encryptedPhone=encryptedPhone.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
            //console.log(encryptedPhone);

            const url = API_BASE_URL+`/api/datainfo/getinfoByPhone?phone=${encodeURIComponent(encryptedPhone)}`;
//console.log(url);
            // 1. 发送请求
            const response = await fetch(url);

            // 2. 关键：必须用await获取response.text()的结果（确保拿到字符串）
            const rawText = await response.text();
            //console.log("原始响应字符串:", rawText); // 应显示类似"[{...},{...}]"的字符串

            // 3. 检查响应是否有效
            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}，内容: ${rawText}`);
            }

            // 4. 解析JSON数组
            try {
                const data = JSON.parse(rawText);

                // 验证是否为数组
                if (Array.isArray(data)) {
                    //console.log("解析成功，数组长度:", data.length);
                    //console.log("解析结果:", data);
                    return data; // 返回解析后的数组
                } else {
                    throw new Error("解析结果不是数组");
                }
            } catch (parseError) {
                throw new Error(`JSON解析失败: ${parseError.message}，原始内容: ${rawText}`);
            }

        } catch (error) {
            //console.error("处理失败:", error.message);
            return []; // 错误时返回空数组
        }
    },

    // 新增记录
    async addRecord(data) {
        // 模拟API延迟
        //await new Promise(resolve => setTimeout(resolve, 500));

        // 从后端获取
        const aesKeyRes = await fetch(API_BASE_URL+'/api/getKey');
        const aesKey = await aesKeyRes.text();
        //console.log(aesKey);

        try {
            // 实际项目中这里会是真实的API调用
            /*return await fetch('http://localhost:9999/api/datainfo', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(res => res.json());*/
            // 生成偏移量
            const iv = generateIv();
            //console.log("iv:",iv);
            const jsonData = JSON.stringify(data);
            //console.log("jsonData:",jsonData);
            // 加密文本
            const encryptedText = encrypt(jsonData, aesKey,iv);
            //console.log("加密文本:",encryptedText);

            const url=API_BASE_URL+"/api/datainfo";
            // 发送请求（包含加密文本和偏移量）
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    encryptedData: encryptedText,
                    iv: iv
                })
            });

            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("加密请求错误:", error);
            throw error;
        }

        // 模拟添加数据
        //this._data.push(data);
        //return { success: true };
    }
};

// 加密工具函数
const RsaEncryptor = {
    // 初始化RSA加密器（公钥从后端获取，此处为示例公钥）
    init(publicKey) {
        this.encryptor = new JSEncrypt();
        this.encryptor.setPublicKey(publicKey);
    },

    // 加密手机号
    encryptPhone(phone) {
        if (!this.encryptor) {
            throw new Error("请先初始化RSA加密器");
        }
        // RSA加密后，需要对结果进行URL编码（避免特殊字符影响URL）
        return encodeURIComponent(this.encryptor.encrypt(phone));
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', init);
