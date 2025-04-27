<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

// Canvas and window dimensions
const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWidth = ref(window.innerWidth)
const canvasHeight = ref(window.innerHeight)

// Game elements
const bedsCount = 25 // Total number of beds
const beds = reactive<Bed[]>([])
const player = reactive<Player>({
    x: 100,
    y: 100,
    width: 30,
    height: 50,
    speed: 3,
    isSleeping: false,
    currentBedIndex: -1,
    direction: 'down',
    isMoving: false,
})

// Movement controls
const keys = reactive({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false,
})

// Types
interface Bed {
    id: number
    x: number
    y: number
    width: number
    height: number
    isDragging: boolean
    dragOffsetX: number
    dragOffsetY: number
}

interface Player {
    x: number
    y: number
    width: number
    height: number
    speed: number
    isSleeping: boolean
    currentBedIndex: number
    direction: 'up' | 'down' | 'left' | 'right'
    isMoving: boolean
}

// Initialize game
onMounted(() => {
    // Handle window resize
    window.addEventListener('resize', () => {
        canvasWidth.value = window.innerWidth
        canvasHeight.value = window.innerHeight
        initializeBeds() // Recalculate bed positions on resize
    })

    // Setup keyboard controls
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Setup mouse/touch events for bed interaction
    const canvas = canvasRef.value
    if (canvas) {
        canvas.addEventListener('mousedown', handleMouseDown)
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mouseup', handleMouseUp)
        canvas.addEventListener('click', handleClick)

        // Touch events
        canvas.addEventListener('touchstart', handleTouchStart)
        canvas.addEventListener('touchmove', handleTouchMove)
        canvas.addEventListener('touchend', handleTouchEnd)
    }

    initializeBeds()
    gameLoop()
})

// Initialize bed positions in a grid layout
function initializeBeds() {
    beds.length = 0 // Clear existing beds

    const columns = 5
    const rows = 5
    const bedWidth = 80
    const bedHeight = 120

    const horizontalSpacing = canvasWidth.value / columns
    const verticalSpacing = canvasHeight.value / rows

    for (let i = 0; i < bedsCount; i++) {
        const row = Math.floor(i / columns)
        const col = i % columns

        beds.push({
            id: i,
            x: col * horizontalSpacing + (horizontalSpacing - bedWidth) / 2,
            y: row * verticalSpacing + (verticalSpacing - bedHeight) / 2,
            width: bedWidth,
            height: bedHeight,
            isDragging: false,
            dragOffsetX: 0,
            dragOffsetY: 0,
        })
    }
}

// Game loop
function gameLoop() {
    updatePlayerPosition()
    renderGame()
    requestAnimationFrame(gameLoop)
}

// Update player position based on keyboard input
function updatePlayerPosition() {
    if (player.isSleeping)
        return

    const moveUp = keys.ArrowUp || keys.w
    const moveDown = keys.ArrowDown || keys.s
    const moveLeft = keys.ArrowLeft || keys.a
    const moveRight = keys.ArrowRight || keys.d

    let dx = 0
    let dy = 0

    if (moveUp) {
        dy -= player.speed
        player.direction = 'up'
    }
    if (moveDown) {
        dy += player.speed
        player.direction = 'down'
    }
    if (moveLeft) {
        dx -= player.speed
        player.direction = 'left'
    }
    if (moveRight) {
        dx += player.speed
        player.direction = 'right'
    }

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2)
        dx *= factor
        dy *= factor
    }

    player.isMoving = dx !== 0 || dy !== 0

    // Update position
    const newX = player.x + dx
    const newY = player.y + dy

    // Check boundaries
    if (newX >= 0 && newX + player.width <= canvasWidth.value) {
        player.x = newX
    }

    if (newY >= 0 && newY + player.height <= canvasHeight.value) {
        player.y = newY
    }

    // Check collision with beds
    checkBedCollisions()
}

// Check for collisions between player and beds
function checkBedCollisions() {
    for (const bed of beds) {
    // Expand the collision box a bit for better gameplay feel
        const expandedBed = {
            x: bed.x - 5,
            y: bed.y - 5,
            width: bed.width + 10,
            height: bed.height + 10,
        }

        if (
            player.x < expandedBed.x + expandedBed.width
            && player.x + player.width > expandedBed.x
            && player.y < expandedBed.y + expandedBed.height
            && player.y + player.height > expandedBed.y
        ) {
            // Handle collision - push the player away
            const overlapLeft = player.x + player.width - expandedBed.x
            const overlapRight = expandedBed.x + expandedBed.width - player.x
            const overlapTop = player.y + player.height - expandedBed.y
            const overlapBottom = expandedBed.y + expandedBed.height - player.y

            // Find the smallest overlap and adjust position accordingly
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

            if (!bed.isDragging) {
                if (minOverlap === overlapLeft)
                    player.x = expandedBed.x - player.width
                else if (minOverlap === overlapRight)
                    player.x = expandedBed.x + expandedBed.width
                else if (minOverlap === overlapTop)
                    player.y = expandedBed.y - player.height
                else if (minOverlap === overlapBottom)
                    player.y = expandedBed.y + expandedBed.height
            }
        }
    }
}

// Render the game
function renderGame() {
    const canvas = canvasRef.value
    if (!canvas)
        return

    const ctx = canvas.getContext('2d')
    if (!ctx)
        return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw beds
    beds.forEach((bed, index) => {
        drawBed(ctx, bed, index)
    })

    // Draw player
    if (!player.isSleeping) {
        drawPlayer(ctx)
    }
}

// Draw a bed
function drawBed(ctx: CanvasRenderingContext2D, bed: Bed, index: number) {
    // Draw bed frame
    ctx.fillStyle = '#8B4513' // Brown
    ctx.fillRect(bed.x, bed.y, bed.width, bed.height)

    // Draw mattress
    ctx.fillStyle = '#F5F5DC' // Beige
    ctx.fillRect(bed.x + 5, bed.y + 5, bed.width - 10, bed.height - 10)

    // Draw pillow
    ctx.fillStyle = '#FFFFFF' // White
    ctx.fillRect(bed.x + 10, bed.y + 10, bed.width - 20, bed.height / 4)

    // Draw blanket
    ctx.fillStyle = '#4169E1' // Royal blue
    ctx.fillRect(
        bed.x + 10,
        bed.y + bed.height / 4 + 20,
        bed.width - 20,
        bed.height / 2,
    )

    // If player is sleeping in this bed, draw player
    if (player.isSleeping && player.currentBedIndex === index) {
        ctx.fillStyle = '#FF6347' // Tomato color
        ctx.fillRect(
            bed.x + 20,
            bed.y + 40,
            bed.width - 40,
            bed.height / 3,
        )
    }
}

// Draw the player
function drawPlayer(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#FF6347' // Tomato color
    ctx.fillRect(player.x, player.y, player.width, player.height)

    // Draw head
    ctx.beginPath()
    ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 4,
        player.width / 3,
        0,
        Math.PI * 2,
    )
    ctx.fillStyle = '#FFD700' // Gold color for head
    ctx.fill()

    // Draw face details based on direction
    ctx.fillStyle = '#000000'

    // Eyes and mouth based on direction
    if (player.direction === 'down' || player.direction === 'right') {
    // Right eye
        ctx.beginPath()
        ctx.arc(
            player.x + player.width / 2 + 5,
            player.y + player.height / 4 - 2,
            2,
            0,
            Math.PI * 2,
        )
        ctx.fill()

        // Left eye
        ctx.beginPath()
        ctx.arc(
            player.x + player.width / 2 - 5,
            player.y + player.height / 4 - 2,
            2,
            0,
            Math.PI * 2,
        )
        ctx.fill()

        // Mouth
        ctx.beginPath()
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 4 + 5,
            3,
            0,
            Math.PI,
        )
        ctx.stroke()
    }
    else {
    // Back of head or side view - simpler representation
        ctx.beginPath()
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 4,
            player.width / 4,
            0,
            Math.PI * 2,
        )
        ctx.stroke()
    }
}

// Input handlers
function handleKeyDown(e: KeyboardEvent) {
    if (e.key in keys) {
        keys[e.key as keyof typeof keys] = true
    }
}

function handleKeyUp(e: KeyboardEvent) {
    if (e.key in keys) {
        keys[e.key as keyof typeof keys] = false
    }
}

// Check if a point is inside a bed
function isPointInBed(x: number, y: number, bed: Bed): boolean {
    return (
        x >= bed.x
        && x <= bed.x + bed.width
        && y >= bed.y
        && y <= bed.y + bed.height
    )
}

// Mouse and touch event handlers
function handleMouseDown(e: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas)
        return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    beds.forEach((bed) => {
        if (isPointInBed(x, y, bed)) {
            bed.isDragging = true
            bed.dragOffsetX = x - bed.x
            bed.dragOffsetY = y - bed.y
        }
    })
}

function handleMouseMove(e: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas)
        return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    beds.forEach((bed) => {
        if (bed.isDragging) {
            bed.x = x - bed.dragOffsetX
            bed.y = y - bed.dragOffsetY

            // Keep bed within canvas bounds
            bed.x = Math.max(0, Math.min(canvasWidth.value - bed.width, bed.x))
            bed.y = Math.max(0, Math.min(canvasHeight.value - bed.height, bed.y))
        }
    })
}

function handleMouseUp() {
    beds.forEach((bed) => {
        bed.isDragging = false
    })
}

function handleClick(e: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas)
        return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if player is near a bed and clicked on it
    if (!player.isSleeping) {
        for (let i = 0; i < beds.length; i++) {
            const bed = beds[i]

            if (isPointInBed(x, y, bed)) {
                // Check if player is close enough to the bed
                const playerCenterX = player.x + player.width / 2
                const playerCenterY = player.y + player.height / 2
                const bedCenterX = bed.x + bed.width / 2
                const bedCenterY = bed.y + bed.height / 2

                const distance = Math.sqrt(
                    (playerCenterX - bedCenterX) ** 2
                    + (playerCenterY - bedCenterY) ** 2,
                )

                // If close enough (within 100px), player can sleep
                if (distance < 100) {
                    player.isSleeping = true
                    player.currentBedIndex = i
                    return
                }
            }
        }
    }
    else {
    // If player is already sleeping, clicking anywhere will wake them up
        player.isSleeping = false
        player.currentBedIndex = -1
    }
}

// Touch event handlers (convert touch to mouse events)
function handleTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
        const touch = e.touches[0]
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
        })
        handleMouseDown(mouseEvent)
    }
    e.preventDefault()
}

function handleTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
        const touch = e.touches[0]
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY,
        })
        handleMouseMove(mouseEvent)
    }
    e.preventDefault()
}

function handleTouchEnd(e: TouchEvent) {
    handleMouseUp()

    if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0]
        const clickEvent = new MouseEvent('click', {
            clientX: touch.clientX,
            clientY: touch.clientY,
        })
        handleClick(clickEvent)
    }
    e.preventDefault()
}
</script>

<template>
    <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        class="game-canvas"
    />
</template>

<style scoped>
.game-canvas {
  display: block;
  background-color: #87CEEB; /* Sky blue for background */
  touch-action: none; /* Prevents browser handling of touch events */
}
</style>
