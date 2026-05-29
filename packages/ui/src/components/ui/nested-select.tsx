
import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, LoaderCircleIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { categoriesQueryKeys } from "@/util/queryKeysFactory"
import useFetch from "@/hooks/UseFetch"
import type { ApiResponseBase } from "@/types/api/http"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { cn } from "../../lib/utils"

export interface Category {
    id: number
    name: string
    description: string
    image: {
        id: number
        hash: string
        mime_type: string
        path: string
    }
    is_active: boolean
    sort_order: number
    created_at: string
    parent: null | number
    has_children: boolean
}

interface NestedSelectProps {
    onSelect?: (item: Category) => void
    placeholder?: string
    value?: string | number
}

interface NestedItemProps {
    item: Category
    level: number
    onSelect: (item: Category) => void
}

const endpoint = 'collections'

function NestedItem({ item, level, onSelect }: NestedItemProps) {
    const [isOpen, setIsOpen] = useState(false)
    const paddingLeft = level * 16

    const { data: children, isPending } = useFetch<
        Category[]
    >({
        queryKey: categoriesQueryKeys.filterd({ "filters[parentId]": item.id.toString() }),
        endpoint,
        params: { "filters[parentId]": item.id.toString() },
        select: (data: any) => (data?.data?.items || data?.data || []).map((item: Category) => ({ ...item, value: item.id })) as any,
        enabled: isOpen && item.has_children,
    })

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onSelect(item)
    }

    return (
        <div className={level === 0 ? "border-b last:border-0 py-1" : ""}>
            <div className={cn("flex items-center justify-between gap-2")}>
                <SelectItem
                    value={item.id.toString()}
                    className="relative flex-1 cursor-pointer"
                    onPointerDown={handleClick}
                >
                    <div style={{ paddingLeft: `${paddingLeft}px` }} className="flex items-center gap-2">
                        <Avatar className="size-8 mr-2">
                            <AvatarImage
                                src={item?.image?.path as string}
                                alt={item.name}
                            />
                            <AvatarFallback className="text-xs">
                                {item?.name?.charAt(0)?.toUpperCase() || "-"}
                            </AvatarFallback>
                        </Avatar>
                        <span>{item.name}</span>
                    </div>
                </SelectItem>
                {item.has_children && (
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsOpen(!isOpen)
                        }}
                        className="cursor-pointer p-1 hover:bg-accent rounded transition-colors"
                        type="button"
                    >
                        {isPending && isOpen ? <LoaderCircleIcon className="w-4 h-4 animate-spin" /> : (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                    </button>
                )}
            </div>
            {isOpen && item.has_children && !isPending && (
                children?.map((child: Category) => (
                    <NestedItem key={child.id} item={child} level={level + 1} onSelect={onSelect} />
                ))
            )}
        </div>
    )
}

export function NestedSelect({ onSelect, placeholder = "Select a category...", value }: NestedSelectProps) {
    const [selectedValue, setSelectedValue] = useState(value?.toString() || "")
    const [items, setItems] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const { data: collection, isPending: isCollectionPending } = useFetch<
        Category[]
    >({
        queryKey: categoriesQueryKeys.filterd({ custom_filter: 'collection', ffdls: '1' }),
        endpoint,
        params: { custom_filter: 'collection' },
        select: (data: any) => (data?.data?.items || data?.data || []).map((item: Category) => ({ ...item, value: item.id })) as any,
    })

    const initialCategoryId = value?.toString()
    const shouldFetchInitial = !!initialCategoryId && !selectedCategory && !isCollectionPending

    const { data: initialCategoryData, isPending: isInitialFetchPending } = useFetch<
        Category
    >({
        queryKey: categoriesQueryKeys.getCategory(initialCategoryId ?? ''),
        endpoint: `${endpoint}/${initialCategoryId}`,
        enabled: shouldFetchInitial,
        select: (data: any) => {
            const item = data?.data?.items ? data.data.items[0] : data?.data
            if (!item) return null
            return {
                ...item,
                value: item.id,
                name: item.name || item.en?.name || item.ar?.name,
                parent: typeof item.parent === 'object' ? item.parent?.id : item.parent,
                has_children: item.has_children ?? (Array.isArray(item.children) && item.children.length > 0)
            } as any
        },
    })

    useEffect(() => {
        if (collection) {
            setItems(collection)
        }
    }, [collection])

    useEffect(() => {
        const newValue = value?.toString() || ""

        if (newValue) {
            const foundInCollection = items?.find(c => c.id.toString() === newValue)
            if (foundInCollection) {
                setSelectedCategory(foundInCollection)
                return
            }
            if (initialCategoryData && initialCategoryData.id.toString() === newValue.toString()) {
                setSelectedCategory(initialCategoryData)
                setSelectedValue(initialCategoryData.id.toString())

                setItems(prev => {
                    if (prev.find(item => item.id === initialCategoryData.id)) return prev
                    return [...prev, initialCategoryData]
                })
                return
            }
        }
        if (!newValue) {
            setSelectedCategory(null)
        }

    }, [value, collection, initialCategoryData, items])

    const handleSelect = (item: Category) => {
        setSelectedValue(item.id.toString())
        setSelectedCategory(item)
        onSelect?.(item)
    }

    const handleValueChange = (newValue: string | null) => {
        if (!newValue) return
        setSelectedValue(newValue)
        const foundInCollection = items?.find(c => c.id.toString() === newValue)
        if (foundInCollection) {
            setSelectedCategory(foundInCollection)
        }
    }

    const isLoading = isCollectionPending || isInitialFetchPending

    return (
        <Select value={selectedValue} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full relative">
                <SelectValue placeholder={placeholder}>
                    {
                        selectedCategory?.name ? <div className="flex items-center gap-2">
                            <Avatar className="size-8 mr-2">
                                <AvatarImage
                                    src={selectedCategory?.image?.path as string}
                                    alt={selectedCategory.name}
                                />
                                <AvatarFallback className="text-xs">
                                    {selectedCategory.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span>{selectedCategory.name}</span>
                        </div> : (isLoading ?
                            <div className='text-muted-foreground pointer-events-none absolute inset-y-0 end-8 flex items-center justify-center pr-3 peer-disabled:opacity-50'>
                                <LoaderCircleIcon className='size-4 animate-spin' />
                                <span className='sr-only'>Loading...</span>
                            </div> : placeholder)
                    }
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-96">
                <div className="space-y-1 p-1 relative">
                    {isCollectionPending ? (
                        <div className='flex justify-center p-4 text-muted-foreground'>
                            <LoaderCircleIcon className='size-4 animate-spin' />
                            <span className='sr-only'>Loading...</span>
                        </div>
                    ) : (
                        items?.map((item) => (
                            <NestedItem key={item.id} item={item} level={0} onSelect={handleSelect} />
                        ))
                    )}
                </div>
            </SelectContent>
        </Select>
    )
}
