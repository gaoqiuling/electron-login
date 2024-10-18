import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

// 定义 UserGroup 接口
interface UserItem {
    name: String;
    password: String;
}
interface UserGroup {
    [key: string]: UserItem[];
}

export default createStore({
    state: {
        userGroups: {} as UserGroup,
        newest: []
    },
    mutations: {
        // 添加用户到用户组
        ADD_USER_TO_GROUP(state, { type, name, password }: { type: string; name: string; password: string }) {
            let items = state.userGroups[type]?.filter(user => user.name !== name) ?? [];
            state.userGroups[type] = [];
            state.userGroups[type].push({ name, password });
            state.userGroups[type].push(...items);
         
            state.newest = [];
            state.newest.push(type);
            state.newest.push(name);
            state.newest.push(password);
        }
    },
    actions: {
        addUser({ commit }, type: string, name: string, password: string) {
            commit('ADD_USER_TO_GROUP', type, name, password);
        }
    },
    plugins: [createPersistedState({
        key: 'loginAuth', // 自定义存储的 key
        storage: window.localStorage, // 你可以选择 localStorage 或 sessionStorage
        reducer: state => ({
            userGroups: state.userGroups,
            newest: state.newest
        })
    })],
});
