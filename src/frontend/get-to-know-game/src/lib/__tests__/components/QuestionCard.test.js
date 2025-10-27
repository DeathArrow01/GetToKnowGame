import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import QuestionCard from '../../components/QuestionCard.svelte';

describe('QuestionCard', () => {
    const mockQuestion = {
        id: '1',
        section: 'Food',
        questionText: 'Do you like pizza?'
    };

    it('renders question information correctly', () => {
        render(QuestionCard, { 
            props: { 
                question: mockQuestion 
            } 
        });

        expect(screen.getByText('Food')).toBeInTheDocument();
        expect(screen.getByText('Do you like pizza?')).toBeInTheDocument();
        expect(screen.getByText('❓')).toBeInTheDocument();
    });

    it('renders all response options', () => {
        render(QuestionCard, { 
            props: { 
                question: mockQuestion 
            } 
        });

        expect(screen.getByText('Yay!')).toBeInTheDocument();
        expect(screen.getByText('Nay!')).toBeInTheDocument();
        expect(screen.getByText("I don't care!")).toBeInTheDocument();
        expect(screen.getByText('😍')).toBeInTheDocument();
        expect(screen.getByText('😒')).toBeInTheDocument();
        expect(screen.getByText('🤷')).toBeInTheDocument();
    });

    it('dispatches answerSelected event when answer is clicked', async () => {
        const { component } = render(QuestionCard, { 
            props: { 
                question: mockQuestion 
            } 
        });

        const answerSelectedHandler = vi.fn();
        component.$on('answerSelected', answerSelectedHandler);

        const yayButton = screen.getByText('Yay!');
        await fireEvent.click(yayButton);

        expect(answerSelectedHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { answer: 'Yay!' }
            })
        );
    });

    it('updates selectedAnswer when answer is clicked', async () => {
        const { component } = render(QuestionCard, { 
            props: { 
                question: mockQuestion 
            } 
        });

        const answerSelectedHandler = vi.fn();
        component.$on('answerSelected', answerSelectedHandler);

        const yayButton = screen.getByText('Yay!');
        await fireEvent.click(yayButton);

        // Verify the event was dispatched
        expect(answerSelectedHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { answer: 'Yay!' }
            })
        );

        // Test the styling by rendering with selectedAnswer prop
        const { container } = render(QuestionCard, { 
            props: { 
                question: mockQuestion,
                selectedAnswer: 'Yay!'
            } 
        });

        const selectedButton = container.querySelector('button');
        expect(selectedButton).toHaveClass('bg-gradient-purple', 'border-purple-500', 'text-white');
    });

    it('applies correct styling to selected answer', () => {
        render(QuestionCard, { 
            props: { 
                question: mockQuestion,
                selectedAnswer: 'Yay!'
            } 
        });

        const yayButton = screen.getByText('Yay!').closest('button');
        expect(yayButton).toHaveClass('bg-gradient-purple', 'border-purple-500', 'text-white');
    });

    it('applies default styling to unselected answers', () => {
        render(QuestionCard, { 
            props: { 
                question: mockQuestion,
                selectedAnswer: 'Yay!'
            } 
        });

        const nayButton = screen.getByText('Nay!').closest('button');
        expect(nayButton).toHaveClass('btn-secondary-modern');
        expect(nayButton).not.toHaveClass('bg-gradient-purple');
    });

    it('handles different response types correctly', async () => {
        const { component } = render(QuestionCard, { 
            props: { 
                question: mockQuestion 
            } 
        });

        const answerSelectedHandler = vi.fn();
        component.$on('answerSelected', answerSelectedHandler);

        // Test Nay! button
        const nayButton = screen.getByText('Nay!');
        await fireEvent.click(nayButton);
        expect(answerSelectedHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { answer: 'Nay!' }
            })
        );

        // Test I don't care! button
        const dontCareButton = screen.getByText("I don't care!");
        await fireEvent.click(dontCareButton);
        expect(answerSelectedHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: { answer: "I don't care!" }
            })
        );
    });

    it('renders with different question data', () => {
        const differentQuestion = {
            id: '2',
            section: 'Entertainment',
            questionText: 'Do you watch anime?'
        };

        render(QuestionCard, { 
            props: { 
                question: differentQuestion 
            } 
        });

        expect(screen.getByText('Entertainment')).toBeInTheDocument();
        expect(screen.getByText('Do you watch anime?')).toBeInTheDocument();
    });

    it('maintains accessibility with proper button roles', () => {
        render(QuestionCard, { 
            props: { 
                question: mockQuestion 
            } 
        });

        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(3);
        
        buttons.forEach(button => {
            expect(button).toBeInTheDocument();
        });
    });

    it('applies correct styling when no answer is selected', () => {
        render(QuestionCard, { 
            props: { 
                question: mockQuestion,
                selectedAnswer: null
            } 
        });

        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).toHaveClass('btn-secondary-modern');
            expect(button).not.toHaveClass('bg-gradient-purple', 'border-purple-500', 'text-white');
        });
    });

    it('applies correct styling when different answers are selected', () => {
        // Test with "Nay!" selected
        const { container: nayContainer } = render(QuestionCard, { 
            props: { 
                question: mockQuestion,
                selectedAnswer: 'Nay!'
            } 
        });

        const nayButton = nayContainer.querySelector('button:nth-child(2)'); // Second button (Nay!)
        expect(nayButton).toHaveClass('bg-gradient-purple', 'border-purple-500', 'text-white');

        // Test with "I don't care!" selected
        const { container: dontCareContainer } = render(QuestionCard, { 
            props: { 
                question: mockQuestion,
                selectedAnswer: "I don't care!"
            } 
        });

        const dontCareButton = dontCareContainer.querySelector('button:nth-child(3)'); // Third button (I don't care!)
        expect(dontCareButton).toHaveClass('bg-gradient-purple', 'border-purple-500', 'text-white');
    });

    it('handles undefined selectedAnswer correctly', () => {
        render(QuestionCard, { 
            props: { 
                question: mockQuestion,
                selectedAnswer: undefined
            } 
        });

        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).toHaveClass('btn-secondary-modern');
            expect(button).not.toHaveClass('bg-gradient-purple');
        });
    });
});
