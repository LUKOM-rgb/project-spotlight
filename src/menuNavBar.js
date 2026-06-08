import {
  mdiAccount,
  mdiCogOutline,
  mdiEmail,
  mdiLogout,
  mdiThemeLightDark,
  mdiGithub,
  mdiReact,
} from '@mdi/js'

export default [
  {
    isCurrentUser: true,
    menu: [
      {
        icon: mdiAccount,
        label: 'O Meu Perfil',
        to: '/profile',
      },
    ],
  },
]
