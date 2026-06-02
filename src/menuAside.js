import {
  mdiAccountCircle,
  mdiMonitor,
  mdiGithub,
  mdiLock,
  mdiAlertCircle,
  mdiSquareEditOutline,
  mdiTable,
  mdiViewList,
  mdiTelevisionGuide,
  mdiResponsive,
  mdiPalette,
  mdiLogout,
} from '@mdi/js'

export const menuAsideMain = [
  {
    to: '/',
    icon: mdiMonitor,
    label: 'Dashboard',
  },
  {
    to: '/spots',
    label: 'Pontos de Interesse',
    icon: mdiTable,
  },
  {
    to: '/profile',
    label: 'O Meu Perfil',
    icon: mdiAccountCircle,
  }
]

export const menuAsideBottom = [
  {
    label: 'Logout',
    icon: mdiLogout,
    color: 'info',
    isLogout: true,
  },
]
