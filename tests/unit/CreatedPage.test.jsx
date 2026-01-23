import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import IngredientsPage from '../../src/game-pages/ingredients-page/IngredientsPage.jsx'
import { createTestStore } from './testStore'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => navigateMock,
    }
})

beforeEach(() => {
    global.fetch = vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve([
                    { id: 1, name: 'Джин', type: 'alcohol' },
                    { id: 2, name: 'Тоник', type: 'soft' },
                ]),
        })
    )
})

afterEach(() => {
    vi.clearAllMocks()
})


const renderPage = (store) =>
    render(
        <Provider store={store}>
            <MemoryRouter>
                <IngredientsPage />
            </MemoryRouter>
        </Provider>
    )

describe('IngredientsPage', () => {
    let store

    beforeEach(() => {
        store = createTestStore({
            game: {
                mode: 'normal',
                selectedIngredients: {},
                cocktailId: 1,
                cocktailData: {
                    ingredients: [
                        { id: 1, name: 'Джин' },
                        { id: 2, name: 'Тоник' },
                    ],
                },
                stages: {
                    stage1: {
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
            screen.getByText('Ингредиенты')
        ).toBeInTheDocument()
    })

    it('загружает и отображает ингредиенты', async () => {
        renderPage(store)

        expect(await screen.findByText('Джин')).toBeInTheDocument()
        expect(screen.getByText('Тоник')).toBeInTheDocument()
    })

    it('клик по ингредиенту добавляет его в store', async () => {
        renderPage(store)

        const gin = await screen.findByText('Джин')
        fireEvent.click(gin)

        const state = store.getState().game
        expect(state.selectedIngredients[1]).toBeDefined()
        expect(state.selectedIngredients[1].name).toBe('Джин')
    })

    it('повторный клик по ингредиенту убирает его из store', async () => {
        renderPage(store)

        const gin = await screen.findByText('Джин')
        fireEvent.click(gin)
        fireEvent.click(gin)

        const state = store.getState().game
        expect(state.selectedIngredients[1]).toBeUndefined()
    })

    it('при отсутствии ошибок переходит на /proportions', async () => {
        renderPage(store)

        fireEvent.click(
            await screen.findByText('Создать с пропорциями')
        )

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/proportions')
        })
    })
})
