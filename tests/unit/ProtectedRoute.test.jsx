
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import ProportionsPage from '../../src/game-pages/proportions-page/ProportionsPage.jsx'
import { createTestStore } from './testStore'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

const renderPage = (store) =>
    render(
        <Provider store={store}>
          <MemoryRouter>
            <ProportionsPage />
          </MemoryRouter>
        </Provider>
    )

describe('ProportionsPage', () => {
  let store

  beforeEach(() => {
    store = createTestStore({
      game: {
        mode: 'normal',
        cocktailId: 1,
        selectedIngredients: {
          1: { id: 1, name: 'Джин', amount: 50 },
          2: { id: 2, name: 'Тоник', amount: 150 },
        },
        cocktailData: {
          ingredients: [
            { id: 1, name: 'Джин', unit: 'ml' },
            { id: 2, name: 'Тоник', unit: 'ml' },
          ],
        },
        stages: {
          stage2: {
            mistakes: 0,
            stepsCount: 0,
            score: 0,
          },
        },
        gameOver: false,
      },
    })
  })

  it('рендерит заголовок страницы', () => {
    renderPage(store)

    expect(
        screen.getByText('Пропорции')
    ).toBeInTheDocument()
  })

  it('отображает ингредиенты с инпутами и единицами измерения', () => {
    renderPage(store)

    expect(screen.getByText('Джин')).toBeInTheDocument()
    expect(screen.getByText('Тоник')).toBeInTheDocument()
    expect(screen.getAllByDisplayValue(/50|150/)).toHaveLength(2)
    expect(screen.getAllByText('ml')).toHaveLength(2)
  })

  it('изменение количества диспатчит setIngredientAmount', async () => {
    renderPage(store)

    const input = screen.getByDisplayValue('50')
    fireEvent.change(input, { target: { value: '60' } })

    const state = store.getState().game
    expect(state.selectedIngredients[1].amount).toBe(60)
  })

  it('при отсутствии ошибок переходит на /create', async () => {
    renderPage(store)

    fireEvent.click(
        screen.getByText('Перейти к созданию')
    )

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/create')
    })
  })

  it('если нет ингредиентов с количеством — показывает сообщение', () => {
    const emptyStore = createTestStore({
      game: {
        ...store.getState().game,
        selectedIngredients: {},
      },
    })

    renderPage(emptyStore)

    expect(
        screen.getByText('Нет ингредиентов с заданным количеством')
    ).toBeInTheDocument()
  })

  it('в hard mode при превышении ошибок открывает HardModeFailModal', async () => {
    const hardStore = createTestStore({
      game: {
        ...store.getState().game,
        mode: 'hard',
        stages: {
          stage2: {
            mistakes: 2,
            stepsCount: 2,
            score: 0,
          },
        },
      },
    })

    renderPage(hardStore)

    fireEvent.click(
        screen.getByText('Перейти к созданию')
    )

    await waitFor(() => {
      expect(
          screen.getByText('Превышено количество ошибок')
      ).toBeInTheDocument()
    })
  })
})

