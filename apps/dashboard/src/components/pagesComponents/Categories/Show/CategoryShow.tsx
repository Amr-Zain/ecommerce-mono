import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Table, TableBody, TableCell, TableRow } from '@ecommerce/ui/components/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ecommerce/ui/components/tabs'
import { Separator } from '@ecommerce/ui/components/separator'
import { Switch } from '@ecommerce/ui/components/switch'
import { Button } from '@ecommerce/ui/components/button'
import { Avatar, AvatarImage, AvatarFallback } from '@ecommerce/ui/components/avatar'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { formatDate } from '@/util/helpers'
import { useMutate } from '@/hooks/UseMutate'
import { categoriesQueryKeys } from '@/util/queryKeysFactory'
import { ApiResponse } from '@/types/api/http'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
    Edit,
    Plus,
    Trash2,
    ShoppingBag,
    Store,
    Image as ImageIcon,
    Layers,
    Hash,
    Calendar,
    SortAsc,
    FolderTree,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import ShopifyMappingDialog from './ShopifyMappingDialog'
import { HasPermission } from '@/components/common/HasPermission'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useNavigate } from '@tanstack/react-router'
import { hasPermission } from '@/lib/utils'
import ButtonCopy from '@ecommerce/ui/components/copy-button'

export type ShopifyMappingData = {
    id?: number
    shopify_collection_gid: string
    shopify_collection_name: string
    odoo_metaobject_gid: string
    odoo_category_name: string
    is_active: boolean
}

export type ChildCollection = {
    id: number
    name?: string
    is_active: boolean
    sort_order: number
    image?: { path: string } | null
    en?: { name: string }
    ar?: { name: string }
}

export type CategoryShowData = {
    id: number
    image?: { path: string; mime_type?: string } | null
    is_active: boolean
    sort_order: number
    created_at: string
    en: { name: string; description?: string }
    ar: { name: string; description?: string }
    parent?: { id: number; name?: string; en?: { name: string }; ar?: { name: string } } | null
    children?: ChildCollection[]
    shopify_mappings: ShopifyMappingData[]
}

export function CategoryShow({ category }: { category: CategoryShowData }) {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const alert = useAlertModal()
    const navigate = useNavigate()
    const [editMapping, setEditMapping] = useState<ShopifyMappingData | null>(null)
    const [showAddDialog, setShowAddDialog] = useState(false)

    const { mutate, isPending: mappingPending } = useMutate({
        endpoint: `collections/${category.id}`,
        method: 'patch',
        mutationKey: categoriesQueryKeys.getCategory(String(category.id)),
        mutationOptions: {
            meta: {
                invalidates: [
                    categoriesQueryKeys.all(),
                    categoriesQueryKeys.getCategory(String(category.id)),
                ],
            },
        },
        onSuccess: (data: ApiResponse) => {
            toast.success(data.message)
            queryClient.invalidateQueries({
                queryKey: categoriesQueryKeys.getCategory(String(category.id)),
            })
        },
        onError: (_e, normalized) => toast.error(normalized.message),
    })

    const { mutateAsync: changeActive, isPending: activePending } = useStatusMutation(
        String(category.id),
        'active',
        'collections',
        categoriesQueryKeys.getCategory(String(category.id)),
        [categoriesQueryKeys.all(), categoriesQueryKeys.getCategory(String(category.id))],
    )

    const { mutateAsync: changeDelete, isPending: deletePending } = useStatusMutation(
        String(category.id),
        'delete',
        'collections',
        categoriesQueryKeys.getCategory(String(category.id)),
        [categoriesQueryKeys.all()],
    )

    useEffect(() => {
        alert.setPending(activePending || deletePending)
    }, [activePending, deletePending])

    const openAlert = (type: PickedAction) => {
        const handler = async () => {
            if (type === 'active') {
                await changeActive({ is_active: !category.is_active })
            } else if (type === 'delete') {
                await changeDelete({})
                navigate({ to: '/categories', search: { custom_filter: 'collection' } as any })
            }
            alert.setIsOpen(false)
        }
        const { title, desc } = getModalTitle(type, 'category', t)
        alert.setModel({
            isOpen: true,
            variant: type === 'delete' ? 'destructive' : 'default',
            title,
            desc,
            pending: activePending || deletePending,
            handleConfirm: handler,
        })
        alert.setHandler(handler)
    }

    const openMappingAlert = (type: 'active' | 'delete', mapping?: ShopifyMappingData) => {
        const handler = async () => {
            if (type === 'active' && mapping) {
                mutate({ shopify_mappings: category.shopify_mappings.map(m => m.id === mapping.id ? { ...m, is_active: !m.is_active } : m) })
            } else if (type === 'delete' && mapping?.id) {
                mutate({ shopify_mappings: category.shopify_mappings.filter(m => m.id !== mapping.id).map(({ id, ...rest }) => ({ ...rest })) })
            }
            alert.setIsOpen(false)
        }
        const entity = t('categories.shopify_mappings')
        alert.setModel({
            isOpen: true,
            variant: type === 'delete' ? 'destructive' : 'default',
            title: t(`modals.${type === 'active' ? 'active' : 'delete'}.title`, { entity }),
            desc: t(`modals.${type === 'active' ? 'active' : 'delete'}.desc`, { entity }),
            pending: mappingPending,
            handleConfirm: handler,
        })
        alert.setHandler(handler)
    }

    const handleSaveMapping = (data: Omit<ShopifyMappingData, 'id'>, existingId?: number) => {
        const updatedMappings = existingId
            ? category.shopify_mappings.map(m => m.id === existingId ? { ...m, ...data } : m)
            : [...category.shopify_mappings, data]
        mutate({ shopify_mappings: updatedMappings })
        setEditMapping(null)
        setShowAddDialog(false)
    }

    const categoryName = category.en?.name ?? category.ar?.name ?? '—'
    const parentName = category.parent?.name || category.parent?.en?.name || category.parent?.ar?.name

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 rounded-xl border shadow-sm">
                        {category.image?.path
                            ? <AvatarImage src={category.image.path} alt={categoryName} />
                            : null}
                        <AvatarFallback className="rounded-xl bg-primary/10">
                            <ImageIcon className="h-7 w-7 text-primary" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <FolderTree className="h-6 w-6 text-primary" />
                            {categoryName}
                            {category.ar?.name && category.ar.name !== categoryName && (
                                <span className="text-muted-foreground text-lg font-medium">{category.ar.name}</span>
                            )}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Hash className="h-4 w-4" />
                            <span>#{category.id}</span>
                            <span>•</span>
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(category.created_at)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                        variant={category.is_active ? 'default' : 'secondary'}
                        className="capitalize font-medium px-3 py-1 text-sm"
                    >
                        {category.is_active ? t('status.active') : t('status.inactive')}
                    </Badge>
                    <HasPermission entity="collections" action="update">
                        <Link to="/categories/edit/$id" params={{ id: String(category.id) }}>
                            <Button variant="outline" size="sm">
                                <Edit className="me-1 h-4 w-4" />
                                {t('actions.update', { entity: t('common.category') })}
                            </Button>
                        </Link>
                    </HasPermission>
                    <HasPermission entity="collections" action="delete">
                        <Button variant="destructive" size="sm" onClick={() => openAlert('delete')} disabled={deletePending}>
                            <Trash2 className="me-1 h-4 w-4" />
                            {t('actions.delete', { entity: t('common.category') })}
                        </Button>
                    </HasPermission>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main content — left 2 cols */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Localized Content */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 pb-2">
                            <div className="flex items-center gap-2 pt-4">
                                <Layers className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">
                                    {t('countryShow.localized.title', { defaultValue: 'Localized Details' })}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Tabs defaultValue="en" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="en">{t('english')}</TabsTrigger>
                                    <TabsTrigger value="ar">{t('arabic')}</TabsTrigger>
                                </TabsList>
                                {(['en', 'ar'] as const).map((lang) => (
                                    <TabsContent key={lang} value={lang} className="mt-4 space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {t('Form.labels.name')}
                                            </p>
                                            <p className="font-semibold text-sm">{category[lang]?.name || '—'}</p>
                                        </div>
                                        {category[lang]?.description && (
                                            <>
                                                <Separator />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                        {t('Form.labels.description')}
                                                    </p>
                                                    <div
                                                        className="prose prose-sm dark:prose-invert max-w-none text-sm"
                                                        dangerouslySetInnerHTML={{ __html: category[lang]?.description || '' }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Sub-Collections */}
                    {category.children && category.children.length > 0 && (
                        <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 pb-2">
                                <div className="flex items-center gap-2 pt-4">
                                    <FolderTree className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">
                                        {t('Text.sub_collection', { defaultValue: 'Sub Collections' })}
                                    </CardTitle>
                                    <Badge variant="secondary" className="ms-auto font-bold">
                                        {category.children.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {category.children.map((child) => {
                                        const childName = child.name || child.en?.name || child.ar?.name || '—'
                                        return (
                                            <Link
                                                key={child.id}
                                                to="/categories/show/$id"
                                                params={{ id: String(child.id) }}
                                                className="group flex items-center gap-3 rounded-xl border p-3 hover:border-primary/50 hover:bg-muted/40 transition-all"
                                            >
                                                <Avatar className="h-11 w-11 rounded-lg flex-shrink-0">
                                                    {child.image?.path ? <AvatarImage src={child.image.path} alt={childName} /> : null}
                                                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-sm">
                                                        {childName.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                                        {childName}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={child.is_active ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4">
                                                            {child.is_active ? t('status.active') : t('status.inactive')}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">#{child.id}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Shopify Mappings */}
                    {category?.shopify_mappings?.length > 0 && (
                        <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 pb-2">
                                <div className="flex items-center gap-2 pt-4">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{t('categories.shopify_mappings')}</CardTitle>
                                    <HasPermission entity="collections" action="update">
                                        <Button size="sm" className="ms-auto" onClick={() => setShowAddDialog(true)}>
                                            <Plus className="me-1 h-4 w-4" />
                                            {t('actions.add')}
                                        </Button>
                                    </HasPermission>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 p-0">
                                <div className="divide-y">
                                    {category.shopify_mappings.map((mapping) => (
                                        <div key={mapping.id} className="px-6 py-4 space-y-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                                                        <ShoppingBag className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm">{mapping.shopify_collection_name || '—'}</p>
                                                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[220px]">
                                                            {mapping.shopify_collection_gid}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Badge variant={mapping.is_active ? 'default' : 'destructive'} className="rounded-full text-[10px]">
                                                        {mapping.is_active ? t('status.enabled') : t('status.disabled')}
                                                    </Badge>
                                                    <HasPermission entity="collections" action="update">
                                                        <Switch
                                                            checked={mapping.is_active}
                                                            onCheckedChange={() => openMappingAlert('active', mapping)}
                                                            disabled={mappingPending}
                                                        />
                                                    </HasPermission>
                                                    <HasPermission entity="collections" action="update">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditMapping(mapping)}>
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </HasPermission>
                                                    <HasPermission entity="collections" action="delete">
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => mapping.id && openMappingAlert('delete', mapping)}
                                                            disabled={mappingPending}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </HasPermission>
                                                </div>
                                            </div>
                                            {(mapping.odoo_metaobject_gid || mapping.odoo_category_name) && (
                                                <div className="flex items-start gap-3 ps-13 bg-muted/30 rounded-xl p-3 border border-muted/40">
                                                    <Store className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                    <div className="space-y-0.5 min-w-0">
                                                        {mapping.odoo_category_name && (
                                                            <p className="text-sm font-medium">{mapping.odoo_category_name}</p>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[240px]">{mapping.odoo_metaobject_gid}</p>
                                                            <ButtonCopy content={mapping.odoo_metaobject_gid} className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar — right col */}
                <div className="space-y-6">
                    {/* General Info */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                        <CardHeader className="border-b border-muted/40 pb-2!">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                {t('countryShow.general.title', { defaultValue: 'General' })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Hash className="h-3.5 w-3.5" /> ID
                                    </span>
                                    <span className="font-bold font-mono">#{category.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <SortAsc className="h-3.5 w-3.5" /> {t('Form.labels.sortOrder')}
                                    </span>
                                    <span className="font-bold">{category.sort_order}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" /> {t('table.createdAt')}
                                    </span>
                                    <span className="font-bold text-xs">{formatDate(category.created_at)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                        <CardHeader className="border-b border-muted/40 pb-2!">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                {t('table.columns.status')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                        {category.is_active ? t('status.active') : t('status.inactive')}
                                    </Badge>
                                </div>
                                <HasPermission entity="collections" action="update">
                                    <Switch
                                        checked={category.is_active}
                                        onCheckedChange={() => openAlert('active')}
                                        disabled={activePending}
                                    />
                                </HasPermission>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parent Category */}
                    {category.parent && (
                        <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                            <CardHeader className="border-b border-muted/40 pb-2!">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    {t('Form.labels.parentCategory')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3">
                                <Link
                                    to="/categories/show/$id"
                                    params={{ id: String(category.parent.id) }}
                                    className="flex items-center gap-3 group/link"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-sm shadow-inner group-hover/link:bg-primary group-hover/link:text-white transition-all">
                                        {parentName?.charAt(0).toUpperCase() ?? '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm group-hover/link:text-primary transition-colors">
                                            {parentName}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">#{category.parent.id}</p>
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add / Edit Mapping Dialog */}
            <ShopifyMappingDialog
                open={showAddDialog || !!editMapping}
                onClose={() => { setShowAddDialog(false); setEditMapping(null) }}
                mapping={editMapping}
                onSave={handleSaveMapping}
                isPending={mappingPending}
            />
        </div>
    )
}
