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
      {
        isDivider: true,
      },
      {
        icon: mdiLogout,
        label: 'Terminar Sessão',
        isLogout: true,
      },
    ],
  },
  {
    icon: mdiLogout,
    label: 'Sair',
    isDesktopNoLabel: true,
    isLogout: true,
  },
]
