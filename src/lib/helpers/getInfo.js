import Cookies from "js-cookie";
import { goto } from "$app/navigation";




class GetInfo {

    constructor() {
        this.info = null
    }

    Login(email, cpf, senha) {
        fetch("http://localhost:3000/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, cpf: cpf, senha: senha }),
        })
            .then((response) => response.json())
            .then((data) => {
                const { token, refreshToken } = data;
                Cookies.set("token", `${token}`, { expires: 1, path: "/" });
                Cookies.set("refreshToken", `${refreshToken}`, {
                    expires: 1,
                    path: "/",
                });
                Cookies.set("cpf", `${cpf}`, {
                    path: "/",
                });

                try {
                    this.#Get(cpf).then((info) => {
                        if (info) {
                            goto("login");
                        }
                    }).catch((error) => {
                        alert('Email/Cpf ou senha errados')
                        console.error(error)
                    })
                } catch (error) {

                }
            })

            .catch((error) => {
                console.error("Erro na requisição:", error);
                alert("Erro ao conectar ao servidor.");
            });
    }

    async  #Get(cpf) {
        await fetch(`http://localhost:3000/?cpf=${cpf}`).then(response => {
            return response.json();
        }).then(response => {
            if (response) {

                const { nome, departamento, email, cpf, imagem, data, erro } = response

                if (erro) {
                    throw new Error('usuario não encotrado')
                }

                return this.info = { nome: nome, departamento: departamento, email: email, cpf: cpf, imagem: imagem, data: data };
            } else {
                alert('usuario não encontrado')
            }
        })
        return this.info
    }

    // mostra os dados de quem esta logado no momento
    async Show() {
        const cpf = Cookies.get('cpf')

        await this.#Get(cpf).then((data) => {
            return this.info = data
        })

        return this.info

    }

    async GetAllStaffs() {
        await fetch("http://localhost:3000/staff").then((response) => {
            return response.json();
        }).then((response) => {
            return this.info = response
        }).catch((error) => { console.log(error) })
        return this.info
    }


    async toBase64(imagem) {
        if (!imagem) {
            return "";
        }

        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.onload = () => {
                resolve(fileReader.result); // Resolve com o resultado Base64
            };

            fileReader.onerror = (error) => {
                reject(error); // Rejeita caso ocorra algum erro
            };

            fileReader.readAsDataURL(imagem); // Lê a imagem como DataURL
        });
    }


    async UpdateInfo(cpf, nome, email, imagem, senha, departamento) {


        const imagem64 = await this.toBase64(imagem)


        let NewData = {
            nome: nome,
            email: email,
            imagem: imagem64,
            senha: senha,
            departamento: departamento
        }

        let sanitized_data = {}

        for (let info in NewData) {
            if (NewData[info] !== "") {
                sanitized_data[info] = NewData[info]
            }
        }



        try {
            await fetch(`http://localhost:3000/?cpf=${cpf}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sanitized_data)
            }).then((response) => {
                return response.json()
            }).then((data_retornada) => {
                console.log("data retornada: ", data_retornada)
            }).catch((error) => {
                console.log(error)
            })
        } catch (error) {
            console.log(error)
        }


    }

    async DeleteStaff(cpf) {
        try {
            await fetch(`http://localhost:3000/?cpf=${cpf}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }).then((response) => {
                return response.json();
            }).then((data) => {
                //! para testes (basta descomentar):
                //console.log(data.status)
            }).catch((error) => {
                console.log(error)
            })
        } catch (error) {
            console.error(error.erro)
        }
    }


    async CreateStaff(nome, senha, departamento, cpf, email, data_nas, imagem) {

        const imagem64 = await this.toBase64(imagem)


        try {
            fetch("http://localhost:3000/", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    nome: nome,
                    senha: senha,
                    departamento: departamento,
                    cpf: cpf,
                    data: data_nas,
                    email: email,
                    imagem: imagem64
                })
            }).then((response) => {
                return response.json()
            }).then((data) => {
                alert(data.status)
            }).catch((erro) => {
                console.log({ error: erro })
            })
        } catch (error) {
            console.log(error)
        }
    }

    async VerifyActions() {

        // ? teoricamente isso ta funcionando, basta testar

        let senha = prompt(
            "Esta alteração será aplicada, você tem certeza ? \n \n Digite a sua senha:",
        );

        const cpf = Cookies.get("cpf")

        let email = null

        await this.Show(cpf).then((response) => {
            return email = response.email
        })


        await fetch("http://localhost:3000/auth", {
            method: "post",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ email: email, senha: senha, cpf: cpf })
        }).then((response) => {
            return response.json()
        }).then((data) => {
            if ((data.token && data.refreshToken) && !(data === "a senha precisa de no minimo 8 cacateres")) {
                return this.info = true
            } else if (data === "a senha precisa de no minimo 8 cacateres" && !(data.token && data.refreshToken)) {
                alert(data)
                return this.info = false
            } else {
                alert("senha incorreta")
                return this.info = false
            }
        }).catch((error) => {
            return console.error(error)
        })

        return this.info
    }

}

export default GetInfo
