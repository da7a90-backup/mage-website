import type { Actions, PageServerLoad } from './$types'
import { get, patch, putImage } from '$lib/api'
import { redirect, fail, error } from '@sveltejs/kit'

export const load = (async ({ params }: { params: any }) => {
	const profile = await get(`users/search/username?username=${params.username.toLowerCase()}`)
	if (profile.error) {
		throw error(404)
	}
	return {
		profile: profile,
		lazy: {
			channels: get(`channels/user?userId=${profile._id}&skip=${0}&limit=${10}`),
			totalPageViews: get(`analytics/views/total-views?viewType=user&viewId=${profile._id}`),
			totalChannelViews: get(`analytics/views/total-views?viewType=channel&host=${profile._id}`),
			totalChannelViews4Weeks: get(
				`analytics/views/total-views/4-weeks?viewType=channel&host=${profile._id}`
			),
			viewsMonthlyIncr: get(
				`analytics/views/monthly-increase?viewType=channel&host=${profile._id}`
			),
			highestAndCurrentStreak: get(`analytics/stream/streak?userId=${profile._id}`),
			streakMonthlyIncr: get(`analytics/stream/streak/monthly-increase?userId=${profile._id}`),
			totalMins: get(`analytics/stream/total-mins?userId=${profile._id}`),
			totalMinsMonthlyIncr: get(
				`analytics/stream/total-mins/monthly-increase?userId=${profile._id}`
			),
			avgMins: get(`analytics/stream/avg-mins?userId=${profile._id}`)
		}
	}
}) satisfies PageServerLoad

export const actions = {
	'update-profile': async ({ request, locals }: { request: any; locals: any }) => {
		const data: FormData = await request.formData()
		let newUser: any = {}
		addPropertyIfDefined(data, 'displayName', newUser)
		addPropertyIfDefined(data, 'username', newUser)
		addPropertyIfDefined(data, 'category', newUser)
		addPropertyIfDefined(data, 'bio', newUser)
		addPropertyIfDefined(data, 'urls', newUser, true)

		newUser.urls = newUser.urls.filter((i:string) => i)

		const avatar = data.get('avatar') as File

		const banner = data.get('banner') as File

		if (data.get('avatar') !== null && avatar.size > 0) {
			const urlLocation = await putImage(
				`users/current/avatar?bucketName=avatars`,
				data.get('avatar'),
				{
					userId: locals.user.userId,
					token: locals.user.token
				}
			)
			console.log(urlLocation)
		}

		if (data.get('banner') !== null && banner.size > 0) {
			const urlLocation = await putImage(
				`users/current/banner?bucketName=banners`,
				data.get('banner'),
				{
					userId: locals.user.userId,
					token: locals.user.token
				}
			)
			console.log(urlLocation)
		}

		const updatedUser = await patch(`users`, newUser, {
			userId: locals.user.userId,
			token: locals.user.token
		})
		if (updatedUser.exists) {
			const username = data.get('username')
			return fail(422, { username, exists: true })
		} else {
			if (updatedUser._id) {
				locals.user.user = updatedUser
				throw redirect(303, `/${updatedUser.username}`)
			} else {
				throw redirect(303, 'browse')
			}
		}
	},
	sponsor: async () => {
		await new Promise<any>((resolve) => setTimeout(resolve, 1000))
	}
} satisfies Actions

const addPropertyIfDefined = (
	data: FormData,
	property: string,
	newUser: { [key: string]: any },
	list?: boolean
) => {
	const propertyValue = list ? data.getAll(property) : data.get(property)
	if (propertyValue !== null && propertyValue !== undefined) {
		newUser[property] =
			property === 'category' ? JSON.parse(propertyValue.toString()) : propertyValue
	}
}
