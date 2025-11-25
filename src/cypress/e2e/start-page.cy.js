describe('StartPage — E2E тесты', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('отображается заголовок Barcard и кнопка "Начать"', () => {
        cy.get('.title').should('be.visible').and('contain.text', 'Barcard');
        cy.get('.start-button').should('be.visible').and('contain.text', 'Начать');
    });

    it('анимация стаканов работает (хотя бы один трек движется)', () => {
        cy.get('.track-inner')
            .first()
            .should('have.css', 'animation-name')
            .and('include', 'slide');
        cy.get('canvas.glass-icon')
            .first()
            .should('be.visible')
            .and((canvas) => {
                const imgData = canvas[0]
                    .getContext('2d')
                    .getImageData(0, 0, canvas.width(), canvas.height());
                const hasColor = Array.from(imgData.data).some((pixel, i) => {
                    if (i % 4 === 3) return false;
                    return pixel !== 255 && pixel !== 0;
                });
                expect(hasColor).to.be.true;
            });
    });

    context('когда в URL нет параметров — кнопка "Начать" ничего не делает', () => {
        it('клик по кнопке не вызывает переход', () => {
            cy.get('.start-button').click();
            cy.url().should('eq', Cypress.config().baseUrl + '/');
        });
    });
    context('когда пользователь — обычный гость (isBarman=false)', () => {
        it('переходит на /menu', () => {
            cy.visit('/?barId=123&isBarman=false');
            cy.get('.start-button').click();
            cy.url().should('include', '/menu');
        });
    });
    context('когда пользователь — бармен (isBarman=true)', () => {
        it('переходит на /signInPage', () => {
            cy.visit('/?barId=456&isBarman=true');
            cy.get('.start-button').click();
            cy.url().should('include', '/signInPage');
        });
    });

    it('сохраняет barId и isBarman в sessionStorage', () => {
        cy.visit('/?barId=789&isBarman=true');

        cy.window().then((win) => {
            expect(win.sessionStorage.getItem('barId')).to.eq('789');
            expect(win.sessionStorage.getItem('isBarman')).to.eq('true');
        });

        cy.get('.start-button').click();
        cy.url().should('include', '/signInPage');

        cy.window().then((win) => {
            expect(win.sessionStorage.getItem('barId')).to.eq('789');
            expect(win.sessionStorage.getItem('isBarman')).to.eq('true');
        });
    });

    it('работает на разных размерах экрана', () => {
        // Мобильный
        cy.viewport('iphone-xr');
        cy.get('.title').should('be.visible');
        cy.get('.start-button').should('be.visible').and('have.css', 'position', 'absolute');

        // Десктоп
        cy.viewport('iphone-8');
        cy.get('.title').should('be.visible');
        cy.get('.start-button').should('be.visible');
    });
});