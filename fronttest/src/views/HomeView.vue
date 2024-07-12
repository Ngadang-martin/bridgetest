<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '../service/axios'
import TheWelcome from '../components/TheWelcome.vue'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import FileUpload from 'primevue/fileupload'
import Message from 'primevue/message'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'

const isAthenticated = ref<boolean>(false)
const openLoginModal = ref<boolean>(false)
const openRegisterModal = ref<boolean>(false)
const openAddProductModal = ref<boolean>(false)
const isEditing = ref<boolean>(false)
const productDataList = ref<any>([])
const productImage = ref<any>(null)
const userInfo = ref<any>({})
const productErr = ref<any>({
  status: '',
  message: ''
})
const loginErr = ref<any>({
  status: '',
  message: ''
})
const registerErr = ref<any>({
  status: '',
  message: ''
})
const fileupload = ref<any>(null)
const loginData = ref<any>({
  email: '',
  password: ''
})

const registerData = ref<any>({
  email: '',
  name: '',
  password: ''
})

const productData = ref<any>({
  description: '',
  name: '',
  slug: '',
  price: '',
  image: ''
})
const apiUrl = import.meta.env.VITE_APP_API
const imageUrl = import.meta.env.VITE_APP_IMG8URL

const getALlProducts = () => {
  axios
    .get(apiUrl + '/products')
    .then((result) => {
      productDataList.value = result.data.products
    })
    .catch((err) => {
      console.log('🚀 ~ getALlProducts ~ err:', err)
    })
}

const login = () => {
  if (!loginData.value.email && !loginData.value.password && loginData.value.password.length < 8) {
    loginErr.value.status = 'warn'
    loginErr.value.message = 'Please verify your input'
    return
  }
  axios
    .post(apiUrl + '/login', loginData.value)
    .then((result: any) => {
      userInfo.value = result.data.user
      window.localStorage.setItem('token', result.data.token)
      window.localStorage.setItem('uname', result.data.user.name)
      window.localStorage.setItem('umail', result.data.user.email)
      window.location.reload()

      openLoginModal.value = false
    })
    .catch((err) => {
      console.log('🚀 ~ login ~ err:', err)
      openLoginModal.value = false
    })
}

const register = () => {
  if (
    !registerData.value.email &&
    !registerData.value.name &&
    !registerData.value.password &&
    registerData.value.password.length < 8
  ) {
    registerErr.value.status = 'warn'
    registerErr.value.message = 'Please verify your input'
    return
  }
  axios
    .post(apiUrl + '/register', registerData.value)
    .then((result: any) => {
      userInfo.value = result.data.user
      window.localStorage.setItem('token', result.data.token)
      window.localStorage.setItem('uname', result.data.user.name)
      window.localStorage.setItem('umail', result.data.user.email)
      window.location.reload()
      openRegisterModal.value = false
    })
    .catch((err) => {
      if (err?.response?.status == 422) {
        registerErr.value.status = 'info'
        registerErr.value.message = 'Verify your input and try again'
      }
      openRegisterModal.value = false
    })
}

const updatedPhoto = (event: any) => {
  const photo = event.target.files[0]
  const fileInput = document.getElementById('workSpaceImageInput')
  let reader = new FileReader()
  if (photo) {
    reader.readAsDataURL(photo)
    reader.onloadend = () => {
      productData.value.image = photo
    }
  }

  if (photo.type == 'image/jpeg' || photo.type == 'image/png' || photo.type == 'image/jpg') {
    let reader = new FileReader()
    if (photo) {
      reader.readAsDataURL(photo)
      reader.onloadend = () => {
        productData.value.image = photo
      }
    }
  } else {
  }
}

const addProduct = () => {
  if (!productData.value.name && !productData.value.description && !productData.value.price) {
    productErr.value.status = 'warn'
    productErr.value.message = 'Please verify your input'
    return
  }
  productData.value.slug = productData.value.name + Date.now()
  const dataToSend: any = Object.assign({}, productData.value)
  // Create dynamic FormData
  const formData = new FormData()

  Object.keys(dataToSend).forEach((key: any) => {
    switch (key) {
      case 'image':
        formData.append('image', dataToSend[key], dataToSend[key].name)
        break
      // creating formData array

      default:
        formData.append(key, dataToSend[key])
        break
    }
  })

  const config = {
    headers: { 'Content-Type': 'multipart/form-data' }
  }
  axios
    .post(apiUrl + '/products', formData, config)
    .then((result: any) => {
      productDataList.value.unshift(result.data.product)
      productData.value = {}
      console.log('🚀 ~ axios.post ~ result:', result)
    })
    .catch((err) => {
      if (err.response.status == 401) {
        productErr.value.status = 'warn'
        productErr.value.message =
          'You are not authorized to perform this action please login and try again '
      }
      if (err.response.status == 422) {
        productErr.value.status = 'info'
        productErr.value.message =
          'You are not authorized to perform this action please login and try again '
      }
      productData.value = {}
      console.log('🚀 ~ addProduct ~  productErr.value:', productErr.value)
      console.log('🚀 ~ login ~ err:', err)
    })
}

const logout = () => {
  axios
    .post(apiUrl + '/logout')
    .then((result) => {
      localStorage.removeItem('token')
      localStorage.removeItem('uname')
      localStorage.removeItem('umail')
      userInfo.value = {}
      window.location.reload()
    })
    .catch((err) => {
      if (err.response.status == 401) {
        productErr.value.status = 'warn'
        productErr.value.message =
          'You are not authorized to perform this action please login and try again '
      }
      if (err.response.status == 422) {
        productErr.value.status = 'info'
        productErr.value.message =
          'You are not authorized to perform this action please login and try again '
      }
      console.log('🚀 ~ addProduct ~  productErr.value:', productErr.value)
      console.log('🚀 ~ login ~ err:', err)
    })
}

const deleteProduct = (id: number) => {
  axios
    .delete(apiUrl + `/products/${id}`)
    .then((result) => {
      productDataList.value = productDataList.value.filter((elm: any) => elm.id != id)
    })
    .catch((err) => {
      if (err.response.status == 401) {
        productErr.value.status = 'warn'
        productErr.value.message =
          'You are not authorized to perform this action please login and try again '
      }
      if (err.response.status == 422) {
        productErr.value.status = 'info'
        productErr.value.message =
          'You are not authorized to perform this action please login and try again '
      }
      console.log('🚀 ~ addProduct ~  productErr.value:', productErr.value)
      console.log('🚀 ~ login ~ err:', err)
    })
}

const editProduct = () => {
  axios
    .put(apiUrl + `/products/${productData.value.id}`, productData.value)
    .then((result) => {})
    .catch((err) => {
      if (err.response.status == 401) {
        productErr.value.status = 'warn'
        productErr.value.message =
          'You are not authorized to perform this action please login and try again '
      }
      if (err.response.status == 422) {
        productErr.value.status = 'info'
        productErr.value.message =
          'You are not authorized to perform this action please login and try again '
      }
      console.log('🚀 ~ addProduct ~  productErr.value:', productErr.value)
      console.log('🚀 ~ login ~ err:', err)
    })
}

onMounted(() => {
  getALlProducts()
  userInfo.value.token = window.localStorage.getItem('token')
  userInfo.value.name = window.localStorage.getItem('uname')
  userInfo.value.email = window.localStorage.getItem('umail')
  if (userInfo.value.token) {
    isAthenticated.value = true
    axios.defaults.headers.common.Authorization = `Bearer${userInfo.value.token}`
  }
  console.log(import.meta.env.VITE_APP_API)

})
</script>

<template>
  <div>
    <Toast />
    <div class="position">
      <div class="topnav">
        <a class="active" href="#home">Products</a>
        <div class="authbutton" v-if="!isAthenticated">
          <Button
            class="btn-bg"
            label="Login"
            severity="secondary"
            @click="openLoginModal = true"
          />
          <Button
            class="btn-bg"
            label="Register"
            severity="secondary"
            @click="openRegisterModal = true"
          />
        </div>
        <div class="prod-text position" v-else>
          <div>
            <h4>{{ userInfo.name }}</h4>
            <h5>{{ userInfo.email }}</h5>
          </div>
          <Button class="btn-bg" label="Logout" severity="secondary" @click="logout()" />
        </div>
      </div>
    </div>

    <div class="container mt-5 mb-5">
      <div class="d-flex justify-content-center mb-2">
      <Button
        label="Add a product"
        icon="pi pi-check"
        iconPos="right"
        @click="isAthenticated ? (openAddProductModal = true) : (openLoginModal = true)"
      />
    </div>

    <div class="d-flex justify-content-center row">
      
        <div class="col-md-10">
            <div v-for="(item, index) in productDataList" class="row p-2  border mb-3 rounded">
                <div class="col-md-3 mt-1"><img class="img-fluid img-responsive rounded product-image" :src="imageUrl + 'images/' + item.image"></div>
                <div class="col-md-6 mt-1">
                    <h5>{{ item.name }}</h5>
                    <div class="d-flex flex-row">
                        <div class="ratings mr-2"><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i></div><span>310</span>
                    </div>
                    <p class="text-justify text-truncate para mb-0">{{ item.description }}<br><br></p>
                </div>
                <div class="align-items-center align-content-center col-md-3 border-left mt-1">
                    <div class="d-flex flex-row align-items-center">
                        <h4 class="mr-1">{{item.price}} XAF</h4>
                    </div>
                    <h6 class="text-success">Free shipping</h6>
                    <div class="d-flex flex-column mt-4"><button class="btn btn-primary btn-sm" type="button" @click="
              () => {
                productData = item
                isEditing = true
                openAddProductModal = true
              }
            ">Edit</button><button class="btn btn-outline-primary btn-sm mt-2" type="button"  @click="isAthenticated ? deleteProduct(item.id) : (openLoginModal = true)">Delete </button></div>
                </div>
            </div>
           
        </div>
    </div>
</div>

    <Dialog v-model:visible="openLoginModal" modal header="Login" :style="{ width: '25rem' }">
      <span class="text-surface-500 dark:text-surface-400 block mb-8"
        >Enter your login information.</span
      >
      <Message v-if="loginErr.message" :severity="loginErr.status" icon="pi pi-send">{{
        loginErr.message
      }}</Message>
      <div class="flex items-center gap-4 mb-4">
        <label for="Email" class="font-semibold w-24">Email</label>
        <InputText v-model="loginData.email" id="email" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-8">
        <label for="password" class="font-semibold w-24">Password</label>
        <InputText v-model="loginData.password" id="email" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="openLoginModal = false"
        ></Button>
        <Button type="button" label="Save" @click="login()"></Button>
      </div>
    </Dialog>

    <Dialog v-model:visible="openRegisterModal" modal header="Login" :style="{ width: '25rem' }">
      <span class="text-surface-500 dark:text-surface-400 block mb-8"
        >Update your information.</span
      >
      <Message v-if="registerErr.message" :severity="registerErr.status" icon="pi pi-send">{{
        registerErr.message
      }}</Message>
      <div class="flex items-center gap-4 mb-4">
        <label for="Name" class="font-semibold w-24">Name</label>
        <InputText v-model="registerData.name" id="name" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="Email" class="font-semibold w-24">Email</label>
        <InputText id="email" v-model="registerData.email" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-8">
        <label for="password" class="font-semibold w-24">Password</label>
        <InputText
          id="email"
          v-model="registerData.password"
          class="flex-auto"
          autocomplete="off"
        />
      </div>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="openRegisterModal = false"
        ></Button>
        <Button type="button" label="Save" @click="register()"></Button>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="openAddProductModal"
      modal
      header="Add a new Product"
      :style="{ width: '25rem' }"
    >
      <span class="text-surface-500 dark:text-surface-400 block mb-8"
        >Enter your product information.</span
      >
      <Message v-if="productErr.message" :severity="productErr.status" icon="pi pi-send">{{
        productErr.message
      }}</Message>
      <div class="flex items-center gap-4 mb-4">
        <label for="name" class="font-semibold w-24">Product name</label>
        <InputText v-model="productData.name" id="name" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="Description " class="font-semibold w-24">Product Description</label>
        <InputText
          v-model="productData.description"
          id="description"
          class="flex-auto"
          autocomplete="off"
        />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="Price " class="font-semibold w-24">Product Price</label>
        <InputNumber
          v-model="productData.price"
          id="price"
          inputId="integeronly"
          class="flex-auto"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="Price " class="font-semibold w-24">Product image</label>
        <input
          id="workSpaceImageInput"
          ref="workspacePhotoInput"
          type="file"
          placeholder="Logo"
          @change="updatedPhoto"
        />
      </div>
      <div class="flex justify-end gap-2 mt-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="openAddProductModal = false"
        ></Button>
        <Button type="button" label="Save" @click="addProduct()"></Button>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="openAddProductModal"
      modal
      :header="isEditing ? 'Edit a new Product' : 'Add a new Product'"
      :style="{ width: '25rem' }"
    >
      <span class="text-surface-500 dark:text-surface-400 block mb-8"
        >Enter your product information.</span
      >
      <Message v-if="productErr.message" :severity="productErr.status" icon="pi pi-send">{{
        productErr.message
      }}</Message>
      <div class="flex items-center gap-4 mb-4">
        <label for="name" class="font-semibold w-24">Product name</label>
        <InputText v-model="productData.name" id="name" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="Description " class="font-semibold w-24">Product Description</label>
        <InputText
          v-model="productData.description"
          id="description"
          class="flex-auto"
          autocomplete="off"
        />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="Price " class="font-semibold w-24">Product Price</label>
        <InputNumber
          v-model="productData.price"
          id="price"
          inputId="integeronly"
          class="flex-auto"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label for="Price " class="font-semibold w-24">Product image</label>
        <input
          id="workSpaceImageInput"
          ref="workspacePhotoInput"
          type="file"
          placeholder="Logo"
          @change="updatedPhoto"
        />
      </div>
      <div class="flex justify-end gap-2 mt-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="openAddProductModal = false"
        ></Button>
        <Button
          type="button"
          :label="isEditing ? 'Edit' : 'Save'"
          @click="isEditing ? editProduct() : addProduct()"
        ></Button>
      </div>
    </Dialog>
  </div>
</template>

<style>
/* Add a black background color to the top navigation */
.topnav {
  background-color: #fff;
  overflow: hidden;
  border-radius: 1rem;
  width: 50%;
  height: 60px;
  margin-top: 2rem;
  box-shadow: 1px 3px;
  display: flex;
  justify-content: space-between;
}
.product-card {
  background-color: #ffffff;
  overflow: hidden;
  border-radius: 1rem;
  width: 50%;
  /* height: 150px; */
  margin-top: 2rem;
  border-color: #584e4e;
  box-shadow: 2px 5px;
  display: flex;
  justify-content: start;
}

.product-card img {
  margin-top: 1.5rem;
  width: 200px;
  height: 100px;
  margin-left: 0;
  object-fit: contain;
}

.product_lyt {
  display: block;
  justify-items: center;
}

.header {
  color: black;
}
.authbutton {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-right: 5px;
}

.prod-text {
  display: block;
  color: black;
}

.prod-action {
  margin-left: 10px;
  margin-top: 2rem;
}
.btn-bg {
  /* background-color: #04aa6d; */
  /* color: black; */
  margin-right: 2px;
  margin-bottom: 5px;
  /* height: 50%; */
}

/* Style the links inside the navigation bar */
.topnav a {
  float: left;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 16px;
  height: inherit;
  text-decoration: none;
  font-size: 17px;
}

.position {
  display: flex;
  justify-content: center;
}

.position_card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fe));
  grid-gap: 2.5rem;
  text-align: center;
  /* justify-content: center; */
}
.position-start {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

/* Change the color of links on hover */
.topnav a:hover {
  background-color: #ddd;
  color: black;
}

/* Add a color to the active/current link */
.topnav a.active {
  background-color: #04aa6d;
  color: white;
}
</style>
