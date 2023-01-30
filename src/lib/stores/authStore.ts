import { env } from '$env/dynamic/public'
import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store'

export const currentUser: Writable<any> = writable(null)

const logout = () => currentUser.set(null);

async function getUserDetails(jwt: string, userId: string) {
    if (!jwt || !userId) {
        return null
    } else {
        return await fetch(`${env.PUBLIC_API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                authorization: jwt,
                userId
            }
        }).then(async response => {
            const res = await response.json()
            return res.user
        }).catch(() => {
            return null
        })
    }
}

export {
    logout,
    getUserDetails
}
