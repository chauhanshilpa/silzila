import { Action, LoggedDetailsType } from "./IsLoggedInterfaces";

const signedInObj = JSON.parse(localStorage.getItem("accountInfo")||"{}");

const loggedReducer = (
	state:LoggedDetailsType = signedInObj
		? signedInObj
		: {
				isUserLogged: false,
				accessToken: "",
		  },
	action:Action
) => {
	switch (action.type) {
		case "USER_AUTHENTICATED":
			var info = {
				isUserLogged: action.payload.isUserLogged,
				accessToken: action.payload.accessToken,
				tokenType: action.payload.tokenType,
				email: action.payload.email,
				firstName: action.payload.firstName,
				lastName: action.payload.lastName,
				avatar: action.payload.avatar,
			};
			localStorage.setItem("accountInfo", JSON.stringify(info));
			return action.payload;

		case "RESET_USER":
			var resetInfo = {
				isUserLogged: false,
				accessToken: "",
			};
			localStorage.clear()
			localStorage.setItem("accountInfo", JSON.stringify(resetInfo));

			return resetInfo;
		case "UPDATE_TOKEN":
			var updateToken = {
				...state,
				accessToken: action.payload,
			};
			localStorage.setItem("accountInfo", JSON.stringify(updateToken));
			localStorage.setItem("accessToken", action.payload);
			return updateToken;
		default:
			return state;
	}
};

export default loggedReducer;
