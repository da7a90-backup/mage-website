import { env } from '$env/dynamic/public'
import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store'

export const current_user: Writable<any> = writable(null)

export const user_role: Writable<any> = writable(null)
