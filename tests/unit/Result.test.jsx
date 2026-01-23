import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import Result from '../../src/game-pages/result-page/Result.jsx'
import { createTestStore } from './testStore'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => navigateMock,
    }
})

vi.mock('../../src/game-pages/result/CocktailCanvas', () => ({
    default: () => <div data-testid="cocktail-canvas" />,
}))

afterEach(() => {
    vi.clearAllMocks()
})


const renderPage = (store) =>
    render(
        <Provider store={store}>
            <MemoryRouter>
                <Result />
            </MemoryRouter>
        </Provider>
    )


describe('Result page', () => {
    let store

    beforeEach(() => {
        store = createTestStore({
            game: {
                stages: {
                    stage1: { score: 20 },
                    stage2: { score: 30 },
                    stage3: { score: 40 },
                },
            },
        })
    })

    it('рендерит заголовок страницы', () => {
        renderPage(store)

        expect(screen.getByText('Готово!')).toBeInTheDocument()
    })

    it('корректно считает и отображает общий рейтинг', () => {
        renderPage(store)

        expect(
            screen.getByText('Рейтинг: 90 ★')
        ).toBeInTheDocument()
    })

    it('рендерит CocktailCanvas', () => {
        renderPage(store)

        expect(
            screen.getByTestId('cocktail-canvas')
        ).toBeInTheDocument()
    })

    it('кнопка "Переиграть" ведёт на /levelPage', () => {
        renderPage(store)

        fireEvent.click(screen.getByTitle('переиграть'))

        expect(navigateMock).toHaveBeenCalledWith('/levelPage')
    })

    it('кнопка "Бар" ведёт на /menu', () => {
        renderPage(store)

        fireEvent.click(screen.getByTitle('бар'))

        expect(navigateMock).toHaveBeenCalledWith('/menu')
    })

    it('кнопка "Заказать" ведёт на /order', () => {
        renderPage(store)

        fireEvent.click(
            screen.getByRole('button', { name: 'Заказать' })
        )

        expect(navigateMock).toHaveBeenCalledWith('/order')
    })
})
